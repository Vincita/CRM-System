import React, { useRef, useState } from 'react';

const PowerBIPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);

  // Link public từ Power BI (có pageName)
  const embedUrl = "https://app.powerbi.com/view?r=eyJrIjoiZTYzMjI3ZmItM2MwNS00NzFiLWIzMDctNjA0YzhlOGNjZjRkIiwidCI6IjZhYzJhZDA2LTY5MmMtNDY2My1iN2FmLWE5ZmYyYTg2NmQwYyIsImMiOjEwfQ%3D%3D";

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      // Ẩn mũi tên khi đã cuộn đến cuối (cách đáy 10px)
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setShowScrollHint(false);
      }
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* Container có thanh cuộn */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'auto',
          scrollBehavior: 'smooth',
        }}
        onScroll={handleScroll}
      >
        <iframe
          title="Dashboard"
          src={embedUrl}
          frameBorder="0"
          allowFullScreen={true}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
        />
      </div>

      {/* Mũi tên chỉ dẫn cuộn xuống - xuất hiện khi chưa cuộn đến cuối */}
      {showScrollHint && (
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.75)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '30px',
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            animation: 'bounceUpDown 1.8s infinite',
            pointerEvents: 'none',
            zIndex: 10,
            fontWeight: 500,
          }}
        >
          <span style={{ fontSize: '22px' }}>⬇️</span> Kéo xuống để xem thêm
        </div>
      )}

      {/* CSS cho hiệu ứng nhấp nhô và thanh cuộn */}
      <style>{`
        @keyframes bounceUpDown {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-12px); }
        }

        /* Tùy chỉnh thanh cuộn cho đẹp */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default PowerBIPage;