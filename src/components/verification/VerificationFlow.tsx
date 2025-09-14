import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../ui/LoadingSpinner';

interface VerificationFlowProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const VerificationFlow: React.FC<VerificationFlowProps> = ({ onComplete, onSkip }) => {
  const { user, profile, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState({
    identity: null as File | null,
    address: null as File | null,
    selfie: null as File | null
  });
  const [uploadedUrls, setUploadedUrls] = useState({
    identity: '',
    address: '',
    selfie: ''
  });

  // Camera refs / state for selfie step
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const steps = [
    { id: 1, title: 'Proof of Identity', type: 'identity', color: '#4A0E67' },
    { id: 2, title: 'Proof of Address', type: 'address', color: '#F7941D' },
    { id: 3, title: 'Selfie', type: 'selfie', color: '#4A0E67' }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);

  // Start camera when entering selfie step
  useEffect(() => {
    if (currentStepData?.type === 'selfie') {
      startCamera().catch(err => {
        console.error('Camera start error', err);
        setError('Unable to access camera. Please allow camera permission or upload a selfie manually.');
      });
    } else {
      stopCamera();
    }

    // stop camera on unmount
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepData?.type]);

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera API not supported');
    }
    // Request camera (prefer front-facing)
    const constraints: MediaStreamConstraints = {
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
    setIsCameraActive(true);
    setPreviewUrl(null);
    setError('');
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        // @ts-ignore
        videoRef.current.srcObject = null;
      } catch (e) {}
    }
    setIsCameraActive(false);
    setIsCapturing(false);
  };

  const captureSelfie = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Camera not ready');
      return;
    }
    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // size canvas to video size
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Unable to capture image');
      setIsCapturing(false);
      return;
    }

    // draw current frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // convert to blob
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setError('Failed to capture image');
        setIsCapturing(false);
        return;
      }

      // Create a File object so it works with your upload flow
      const timestamp = Date.now();
      const fileName = `${user?.id || 'anon'}_selfie_${timestamp}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      // set file to state
      setFiles(prev => ({ ...prev, selfie: file }));
      // create preview url
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);

      // stop camera (optional — keep it running if you want to retake)
      stopCamera();
      setIsCapturing(false);
      setError('');
    }, 'image/jpeg', 0.9);
  };

  const handleRetake = async () => {
    // cleanup preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setFiles(prev => ({ ...prev, selfie: null }));
    try {
      await startCamera();
    } catch (err) {
      console.error(err);
      setError('Unable to restart camera');
    }
  };

  const handleFileUpload = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setFiles(prev => ({
        ...prev,
        [type]: file
      }));
      setError('');
    }
  };

  const uploadFile = async (file: File, type: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${user.id}/verification/${type}_${timestamp}.${fileExt}`;

      // Add timeout to prevent hanging
      const uploadPromise = supabase.storage
        .from('verification')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Upload timeout')), 30000)
      );

      const { data, error } = await Promise.race([uploadPromise, timeoutPromise]) as any;

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('verification')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Verification upload error:', error);
      throw error;
    }
  };

  const handleNext = async () => {
    const currentType = currentStepData?.type as keyof typeof files;
    const currentFile = files[currentType];

    if (!currentFile) {
      setError('Please upload or capture a file to continue');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const url = await uploadFile(currentFile, currentType);
      setUploadedUrls(prev => ({
        ...prev,
        [currentType]: url
      }));

      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        await completeVerification();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const completeVerification = async () => {
    try {
      setLoading(true);

      // Create verification record
      const { error: verificationError } = await supabase
        .from('verifications')
        .insert({
          user_id: user!.id,
          identity_document: uploadedUrls.identity,
          address_document: uploadedUrls.address,
          selfie_image: uploadedUrls.selfie,
          status: 'pending',
          submitted_at: new Date().toISOString()
        });

      if (verificationError) throw verificationError;

      // Update user profile to mark verification as submitted
      await updateProfile({ verification_submitted: true });

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: user!.id,
          type: 'verification_submitted',
          title: 'Verification Submitted',
          content: 'Your verification documents have been submitted for review. You will be notified once approved.'
        });

      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to complete verification');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const removeFile = (type: string) => {
    if (type === 'selfie' && previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      stopCamera();
    }
    setFiles(prev => ({
      ...prev,
      [type]: null
    }));
  };

  const getStepDescription = (type: string) => {
    switch (type) {
      case 'identity':
        return 'Upload Any Verified means of ID (National/State ID, Drivers\' Licence, BVN, Voters\' Card, etc)';
      case 'address':
        return 'Upload Utility Bill or Bank Statement';
      case 'selfie':
        return 'Take a live selfie using your camera';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#4A0E67] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" color="white" />
          <p className="mt-4 text-white font-semibold">Completing verification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#4A0E67] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-[#4A0E67]">ID Verification</h1>
            <div className="flex items-center space-x-2">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      step.id <= currentStep ? 'bg-[#4A0E67]' : 'bg-gray-300'
                    }`}
                  >
                    {step.id < currentStep ? <CheckCircle size={16} /> : step.id}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 ${step.id < currentStep ? 'bg-[#4A0E67]' : 'bg-gray-300'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
              <AlertCircle size={20} className="mr-2" />
              {error}
            </div>
          )}

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: currentStepData?.color }}>
              {currentStepData?.title}
            </h2>
            <p className="text-gray-600 mb-6">
              {getStepDescription(currentStepData?.type || '')}
            </p>

            <div className="max-w-md mx-auto">
              {/* For selfie step, render camera UI */}
              {currentStepData?.type === 'selfie' ? (
                <div className="border-2 border-dashed rounded-lg p-4" style={{ borderColor: currentStepData.color }}>
                  {/* show preview if captured */}
                  {files.selfie && previewUrl ? (
                    <div className="space-y-4">
                      <img src={previewUrl} alt="Selfie preview" className="mx-auto rounded max-w-full h-auto" />
                      <p className="text-sm font-medium">{files.selfie.name}</p>
                      <div className="flex justify-center space-x-2">
                        <button
                          type="button"
                          onClick={handleRetake}
                          className="px-4 py-2 border rounded"
                        >
                          Retake
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFile('selfie')}
                          className="px-4 py-2 border rounded text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-3">
                        {/* video container */}
                        <div className="relative w-full bg-black rounded overflow-hidden">
                          <video
                            ref={videoRef}
                            className="w-full h-64 object-cover"
                            playsInline
                            muted
                          />
                          {!isCameraActive && (
                            <div className="absolute inset-0 flex items-center justify-center text-white">
                              <p>Camera inactive</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-center space-x-3">
                        {!isCameraActive ? (
                          <button
                            type="button"
                            onClick={() => startCamera().catch(err => setError('Unable to access camera'))}
                            className="px-4 py-2 border rounded"
                          >
                            Start Camera
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={captureSelfie}
                              disabled={isCapturing}
                              className="px-4 py-2 bg-[#4A0E67] text-white rounded disabled:opacity-50"
                            >
                              {isCapturing ? 'Capturing...' : 'Capture'}
                            </button>
                            <button
                              type="button"
                              onClick={stopCamera}
                              className="px-4 py-2 border rounded"
                            >
                              Stop Camera
                            </button>
                          </>
                        )}
                      </div>

                      <p className="text-xs text-gray-400 mt-2">Make sure your face is clearly visible. The captured image will be used for verification.</p>

                      {/* hidden canvas used for capture */}
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  )}
                </div>
              ) : (
                // default file upload UI for identity/address
                <label className="cursor-pointer block">
                  <div
                    className="border-2 border-dashed rounded-lg p-8 hover:bg-gray-50 transition-colors"
                    style={{ borderColor: currentStepData?.color }}
                  >
                    {files[currentStepData?.type as keyof typeof files] ? (
                      <div className="space-y-4">
                        <CheckCircle size={48} className="mx-auto text-green-500" />
                        <p className="text-sm font-medium">
                          {files[currentStepData?.type as keyof typeof files]?.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeFile(currentStepData?.type || '')}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload
                          className="mx-auto mb-2"
                          size={32}
                          style={{ color: currentStepData?.color }}
                        />
                        <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-400 mt-1">.jpg, .png (max 5MB)</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.png,.jpeg"
                    onChange={(e) => handleFileUpload(currentStepData?.type || '', e)}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft size={20} />
                  <span>Previous</span>
                </button>
              )}
              {onSkip && currentStep === 1 && (
                <button
                  onClick={onSkip}
                  className="px-6 py-3 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Skip for now
                </button>
              )}
            </div>

            <button
              onClick={handleNext}
              disabled={uploading || !files[currentStepData?.type as keyof typeof files]}
              className="flex items-center space-x-2 px-6 py-3 bg-[#4A0E67] text-white rounded-lg hover:bg-[#3a0b50] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <LoadingSpinner size="small" color="white" />
              ) : (
                <>
                  <span>{currentStep === steps.length ? 'Complete' : 'Next'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationFlow;
