// Auto-generated utility functions

export function camelCase(str) {
    return str.replace(/[-_\s](.)/g, (_, char) => char.toUpperCase())
              .replace(/^(.)/, (_, char) => char.toLowerCase());
}

export function snakeCase(str) {
    return str.replace(/([A-Z])/g, '_$1')
              .replace(/[-\s]/g, '_')
              .toLowerCase()
              .replace(/^_/, '');
}

export function titleCase(str) {
    return str.replace(/\w\S*/g, txt => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
}

