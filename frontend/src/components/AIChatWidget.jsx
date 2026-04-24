// // src/components/AIChatWidget.jsx
// import { useState } from 'react';
// import ChatBotAssistant from '../pages/ChatBotAssistant.jsx';

// export default function AIChatWidget() {
//   const [open, setOpen] = useState(false);
//   return (
//     <>
//       <button
//         onClick={() => setOpen((v) => !v)}
//         className="fixed bottom-6 right-6 rounded-full shadow-soft bg-blue-600 text-white w-12 h-12 hover:bg-blue-700"
//         aria-label="Open AI chat"
//         title="Assistant"
//       >
//         💬
//       </button>
//       {open && (
//         <div className="fixed bottom-24 right-6 w-[360px] max-w-[95vw] z-50">
//           <div className="card p-3">
//             <div className="flex items-center justify-between mb-2">
//               <h3 className="font-medium">Smart Shelf Assistant</h3>
//               <button className="text-gray-500" onClick={() => setOpen(false)}>Close</button>
//             </div>
//             <ChatBotAssistant />
//           </div>
//         </div>
//       )}
//     </>
//   );
//
// src/components/AIChatWidget.jsx
import { useState } from 'react';
import ChatBotAssistant from '../pages/ChatBotAssistant.jsx';

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 rounded-full shadow-soft bg-blue-600 text-white w-11 h-11 sm:w-12 sm:h-12 hover:bg-blue-700 flex items-center justify-center text-xl sm:text-2xl z-50"
        aria-label="Open AI chat"
        title="Assistant"
      >
        💬
      </button>
      {open && (
        <div className="fixed bottom-20 right-3 sm:bottom-24 sm:right-6 w-[calc(100vw-24px)] sm:w-[360px] max-w-[95vw] z-50">
          <div className="card p-2 sm:p-3 rounded-xl shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-sm sm:text-base">Smart Shelf Assistant</h3>
              <button className="text-gray-500 hover:text-gray-300 text-sm px-2 py-1" onClick={() => setOpen(false)}>Close</button>
            </div>
            <ChatBotAssistant />
          </div>
        </div>
      )}
    </>
  );
}