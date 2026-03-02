const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const COMPONENTS_DIR = path.join(ROOT, 'src', 'components');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix checked="" -> defaultChecked (for uncontrolled)
    // or just checked={true} if we want it forced.
    // Given these are static conversions, defaultChecked is safer.
    content = content.replace(/checked=""/g, 'defaultChecked');

    // Fix disabled="" -> disabled
    content = content.replace(/disabled=""/g, 'disabled');

    // Fix selected="" -> invalid in React for option, should use defaultValue on Select.
    // But blindly removing it might break semantics.
    // However, keeping selected="" causes React error.
    // We will replace selected="" with just NOTHING (ignore it) or try to handle?
    // Actually in React, <option selected> works as defaultSelected?
    // No, React uses `value` on select.
    // But if we just look at the file content, we see `selected=""`.
    // Let's change it to `data-selected` just to suppress error if we don't refactor logic?
    // Or better: `defaultChecked` for radio/checkbox covers most cases.
    // For option: `selected` should be removed in favor of `defaultValue` on parent select.
    // But finding parent select is hard.
    // Replacing `selected=""` with `aria-selected`?
    // Or just `selected` (boolean). React warns "Use defaultValue on Select instead of selected on Option". Warning != Error?
    // But `selected=""` (string) is Error type mismatch.
    // So `selected={true}` is better than string.
    content = content.replace(/selected=""/g, 'selected={true}');
    // This will warn but might pass TS build if type is boolean? No, HTMLOptionElement selected is boolean.

    // Fix readonly="" -> readOnly
    content = content.replace(/readonly=""/g, 'readOnly');

    // Fix autoFocus="" -> autoFocus={true}
    content = content.replace(/autoFocus=""/g, 'autoFocus={true}');

    // Fix required="" -> required
    content = content.replace(/required=""/g, 'required');

    // Fix multiple="" -> multiple
    content = content.replace(/multiple=""/g, 'multiple');

    // Fix value="" for textarea? Textarea uses children or value.
    // <textarea value=""> -> <textarea defaultValue="">
    content = content.replace(/<textarea([^>]*)value="([^"]*)"/g, '<textarea$1defaultValue="$2"');

    // Fix input value="" -> defaultValue="" (uncontrolled)
    // Regex for input with value?
    // content = content.replace(/<input([^>]*)value="([^"]*)"/g, '<input$1defaultValue="$2"');
    // But some inputs might be type="submit" or "button".
    // Only for text inputs?
    // Safer to leave value unless it conflicts with onChange missing (TS warning: "You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field.")
    // This is a WARNING, not error usually.
    // But let's leave value for now.

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed boolean attrs in: ${path.basename(filePath)}`);
    }
}

function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(f => {
        const fp = path.join(dir, f);
        if (fs.statSync(fp).isDirectory()) {
            walk(fp);
        } else if (f.endsWith('.tsx')) {
            processFile(fp);
        }
    });
}

walk(COMPONENTS_DIR);
