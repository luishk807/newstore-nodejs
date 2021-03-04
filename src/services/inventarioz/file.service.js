const Papa = require('papaparse');

const isCsvFileName = (fileName) => {
    if (fileName) {
        return fileName.match(/\.(csv|CSV)$/)
    }
    return false;
}

const parseCsvBuffer = (fileBuffer) => {
    const config = {
        header: true,
        // Trim whitespace from header
        transformHeader: (h) => {
            console.log(h.trim())
            return h.trim();
        }
    }
    const buffer = Buffer.from(fileBuffer, 'utf-8');
    // trim at the end of the buffer.toString() it is to delete any extra empty line (Excel does this)
    const parsed = Papa.parse(buffer.toString().trim(), config);
    logger.info(`Parsed csv into ${parsed.data.length} lines of data`);
    return parsed;
}

const processCsvLine = (data) => {
    data['Proveedor']; // Supplier
    data['Fecha de Compra']; // Buy date
    data['Codigo'];
    data['Item'];
    data['Categoria']; // Category
    data['Division'];
    data['Marca']; // Brand
    data['Producto']; // Product name
    data['Descripcion'];
    data['Color']; // Product variant with color as option, so the value here is the option value
    data['Tamano']; // Product variant with color as option, so the value here is the option value
    data['Cantidad'];
    data['Costo'];
    data['Otros'];
    data['Costo Total'];
    data['Precio al Detal'];
    data['Precio Media Docena'];
    data['Precio por Docena'];
}

const processCsvFile = (file) => {
    if (file) {
        if (isCsvFileName(file.originalname)) {
            const csv = parseCsvBuffer(file.buffer);
            csv.data.forEach(line => {
                processCsvLine(line)
            })
        }
    }
}

module.exports = {
    processCsvFile
}
