/* eslint-disable react/display-name */
'use client';
import { useRef, forwardRef, useImperativeHandle } from 'react';
import SignatureCanvas from 'react-signature-canvas';

const SignaturePad = forwardRef((props, ref) => {
  const sigRef = useRef();

  useImperativeHandle(ref, () => ({
    clear: () => sigRef.current.clear(),
    isEmpty: () => sigRef.current.isEmpty(),
    getBlob: async () => {
      // Convert canvas to blob for upload
      return new Promise(resolve => sigRef.current.getCanvas().toBlob(resolve, 'image/png'));
    }
  }));

  return (
    <div className="border-2 border-dashed border-gray-400 rounded-lg p-2 bg-white">
      <SignatureCanvas
        ref={sigRef}
        penColor="black"
        canvasProps={{
          width: 500,
          height: 200,
          className: 'signature-canvas w-full h-40' 
        }}
      />
      <div className="text-xs text-gray-500 mt-1 text-center">Sign above inside the box</div>
    </div>
  );
});

export default SignaturePad;