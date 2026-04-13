import React from "react";

export default function ImagenUpload({ uploadedImages, setUploadedImages }) {
    const handleAddImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadedImages([...uploadedImages, file]);
        }
    };

    const removeImage = (index) => {
        const newImages = [...uploadedImages];
        newImages.splice(index, 1);
        setUploadedImages(newImages);
    };

    return (
        <div>
            <label className="block text-sm font-bold mb-1">Imágenes del Producto</label>
            <input type="file" accept="image/*" onChange={handleAddImage} className="w-full p-2 border rounded-lg" />
            {uploadedImages.length > 0 && (
                <div className="mt-2">
                    <p className="text-xs font-bold mb-1">Imágenes seleccionadas ({uploadedImages.length})</p>
                    <div className="flex flex-wrap gap-2">
                        {uploadedImages.map((img, idx) => (
                            <div key={idx} className="relative">
                                <img src={URL.createObjectURL(img)} alt="preview" className="w-16 h-16 object-cover rounded-lg border" />
                                <button 
                                    type="button" 
                                    onClick={() => removeImage(idx)} 
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}