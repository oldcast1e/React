import { useState } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';

const UploadModal = ({ isOpen, onClose, onImageSelected }) => {
    const [previewImage, setPreviewImage] = useState(null);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
                onImageSelected(reader.result, file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClose = () => {
        setPreviewImage(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-2xl bg-white rounded-t-3xl p-6 animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">작품 업로드</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Preview */}
                {previewImage && (
                    <div className="mb-6">
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="w-full h-64 object-cover rounded-2xl"
                        />
                    </div>
                )}

                {/* Upload Options */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Camera */}
                    <label className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 hover:border-black hover:bg-gray-100 transition-all cursor-pointer">
                        <Camera size={48} className="mb-3 text-gray-600" />
                        <span className="text-sm font-medium">카메라 촬영</span>
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </label>

                    {/* Gallery */}
                    <label className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 hover:border-black hover:bg-gray-100 transition-all cursor-pointer">
                        <ImageIcon size={48} className="mb-3 text-gray-600" />
                        <span className="text-sm font-medium">갤러리 선택</span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default UploadModal;
