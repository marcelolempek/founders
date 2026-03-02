import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { S3Client, PutObjectCommand } from 'npm:@aws-sdk/client-s3@3.x'
import { getSignedUrl } from 'npm:@aws-sdk/s3-request-presigner@3.x'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Validate JWT
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('Missing authorization header')
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            throw new Error('Unauthorized')
        }

        // Parse request body
        const { path, contentType = 'image/webp' } = await req.json()
        if (!path || typeof path !== 'string') {
            throw new Error('Invalid path')
        }

        // Validate path format: 
        // 1. posts/{uuid}/{variant}/{uuid}.webp
        // 2. avatars/{uuid}/{filename}
        const postPathRegex = /^posts\/[a-f0-9-]{36}\/(thumb|feed|detail)\/[a-f0-9-]{36}\.webp$/i
        const avatarPathRegex = /^avatars\/[a-f0-9-]{36}\/.+$/i

        if (!postPathRegex.test(path) && !avatarPathRegex.test(path)) {
            throw new Error('Invalid path format. Expected: posts/... or avatars/...')
        }

        // Get R2 credentials from environment
        const accessKeyId = Deno.env.get('R2_ACCESS_KEY_ID')
        const secretAccessKey = Deno.env.get('R2_SECRET_ACCESS_KEY')
        const accountId = Deno.env.get('R2_ACCOUNT_ID')
        const bucketName = Deno.env.get('R2_BUCKET_NAME')

        if (!accessKeyId || !secretAccessKey || !accountId || !bucketName) {
            throw new Error('Missing R2 configuration')
        }

        // Initialize S3 client for R2
        const s3Client = new S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        })

        // Create presigned URL for PUT (5 minute expiration)
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: path,
            ContentType: contentType,
        })

        const uploadUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 300, // 5 minutes
        })

        return new Response(
            JSON.stringify({
                uploadUrl,
                expiresIn: 300,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({
                error: error.message,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
