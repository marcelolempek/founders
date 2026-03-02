export type ViewerRole = 'owner' | 'viewer' | 'admin' | 'guest';

export type PostAction =
    | 'view'
    | 'edit'
    | 'delete'
    | 'markSold'
    | 'boost'
    | 'report'
    | 'block'
    | 'like'
    | 'bookmark'
    | 'share'
    | 'whatsapp';

export interface PostContextProps {
    viewerRole: ViewerRole;
    postId: string;
    authorId: string;
}
