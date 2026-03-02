const fs = require('fs');
const path = require('path');

const rootDir = process.argv[2] || './src';

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            walk(filePath);
        } else if (stats.isFile() && /\.(tsx|ts|js|jsx|css|md)$/.test(file)) {
            let content = fs.readFileSync(filePath, 'utf8');
            let originalContent = content;

            // Perform replacements
            content = content.replace(/CODE 6MM/gi, 'Empreendedores de Cristo');
            content = content.replace(/Code6mm/gi, 'Empreendedores de Cristo');

            // Branding terms
            content = content.replace(/Airsoft/gi, 'Empreendedorismo');

            // Color replacements (Green to Blue)
            content = content.replace(/#13e761/gi, '#2563eb');
            content = content.replace(/#10c853/gi, '#1d4ed8'); // darker green to darker blue
            content = content.replace(/rgba\(19, 231, 97/gi, 'rgba(37, 99, 235'); // shadow green to blue

            // Theme colors from globals.css mappings if hardcoded elsewhere
            content = content.replace(/#111813/gi, '#0f172a'); // Background dark
            content = content.replace(/#1c2720/gi, '#1e293b'); // Surface dark
            content = content.replace(/#28392e/gi, '#334155'); // Border/Scrollbar
            content = content.replace(/#9db9a7/gi, '#94a3b8'); // Text secondary

            // Domain specific replacements
            content = content.replace(/Equipamentos/g, 'Produtos/Serviços');
            content = content.replace(/equipamentos/g, 'produtos/serviços');
            content = content.replace(/Armamentos/g, 'Ferramentas');
            content = content.replace(/Vendas de Marcadores/g, 'Ofertas de Serviços');
            content = content.replace(/Réplicas de Empreendedorismo/g, 'Soluções Profissionais');
            content = content.replace(/Marcadores/g, 'Produtos');
            content = content.replace(/Fair Play, Safe Games/g, 'Integridade e Profissionalismo');


            if (content !== originalContent) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated: ${filePath}`);
            }
        }
    });
}

console.log(`Starting rebranding sweep in ${rootDir}...`);
walk(rootDir);
console.log('Sweep completed.');
