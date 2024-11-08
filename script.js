let cropper;
let selectedShape = 'rectangle'; // Forma seleccionada por defecto

// Función para cargar la imagen
document.getElementById('uploadImage').addEventListener('change', function(event) {
    const file = event.target.files[0];
    
    // Verificar que el archivo es una imagen
    if (file) {
        const reader = new FileReader();
        
        // Verificar el tipo de archivo
        if (!file.type.startsWith('image/')) {
            alert("Por favor, selecciona una imagen válida.");
            return;
        }
        
        reader.onload = function(e) {
            const image = document.getElementById('image');
            image.src = e.target.result;
            
            // Si ya existe un cropper, destruirlo
            if (cropper) {
                cropper.destroy();
            }
            
            image.onload = () => {
                cropper = new Cropper(image, {
                    aspectRatio: NaN,  // Esto permite un recorte libre
                    viewMode: 1,
                    autoCropArea: 0.5,
                    scalable: true,
                    zoomable: true,
                    cropBoxResizable: true,
                    movable: true,
                    ready() {
                        setShape(selectedShape);
                    },
                });
            };
        };
        
        // Leer el archivo como DataURL
        reader.readAsDataURL(file);
    }
});

// Función para seleccionar la forma de recorte
function selectShape(shape) {
    selectedShape = shape;
    if (cropper) {
        setShape(shape);
    }
}

// Función para establecer la forma de recorte
function setShape(shape) {
    if (shape === 'rectangle') {
        cropper.setAspectRatio(NaN);  // Recorte libre, sin restricciones
    } else if (shape === 'circle') {
        cropper.setAspectRatio(1);  // Relación de aspecto 1:1 (cuadrado)
    } else if (shape === 'polygon') {
        cropper.setAspectRatio(NaN);  // Sin restricción de aspecto, se hará un polígono
    }
}

// Función para recortar la imagen
document.getElementById('cropButton').addEventListener('click', function() {
    if (!cropper) {
        alert("Por favor, sube una imagen primero.");
        return;
    }
    
    const canvas = cropper.getCroppedCanvas({
        width: 400,
        height: 400,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
    });

    // Si la forma es círculo, recortamos en forma circular
    if (selectedShape === 'circle') {
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = canvas.width / 2;

        // Crear un canvas temporal para dibujar el círculo
        const circularCanvas = document.createElement('canvas');
        circularCanvas.width = canvas.width;
        circularCanvas.height = canvas.height;
        const circularCtx = circularCanvas.getContext('2d');

        // Dibuja un círculo en el canvas temporal
        circularCtx.beginPath();
        circularCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        circularCtx.closePath();
        circularCtx.clip(); // Aplica la máscara circular

        // Luego dibuja la imagen en la región circular
        circularCtx.drawImage(canvas, 0, 0);

        // Actualiza el resultado en el canvas final
        const resultCanvas = document.getElementById('resultCanvas');
        resultCanvas.width = circularCanvas.width;
        resultCanvas.height = circularCanvas.height;
        const resultCtx = resultCanvas.getContext('2d');
        resultCtx.drawImage(circularCanvas, 0, 0);
    } else {
        // Si no es círculo, mostramos la imagen recortada normalmente
        const resultCanvas = document.getElementById('resultCanvas');
        resultCanvas.width = canvas.width;
        resultCanvas.height = canvas.height;
        const resultCtx = resultCanvas.getContext('2d');
        resultCtx.drawImage(canvas, 0, 0);
    }
});

// Función para guardar la imagen recortada
document.getElementById('saveButton').addEventListener('click', function() {
    const resultCanvas = document.getElementById('resultCanvas');
    
    // Verificar si el canvas contiene una imagen
    if (resultCanvas.width === 0 || resultCanvas.height === 0) {
        alert("No hay imagen recortada para guardar.");
        return;
    }

    // Convertir el canvas a una URL de imagen
    const imageUrl = resultCanvas.toDataURL('image/png');
    
    // Crear un enlace para descargar la imagen
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'imagen_recortada.png';  // Nombre del archivo descargado
    link.click();  // Simula el clic para iniciar la descarga
});
