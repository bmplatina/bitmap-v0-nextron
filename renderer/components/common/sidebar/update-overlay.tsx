import React, { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { Text } from "@radix-ui/themes";
import { UpdateProgress, UpdateStatus, UpdateStatusType } from "@/lib/types";

const UpdateOverlay: React.FC = () => {
  const { t } = useTranslation("Settings");

  const [status, setStatus] = useState<UpdateStatusType>("idle");
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState<UpdateProgress | null>(null);

  useEffect(() => {
    // 메인 프로세스로부터 상태 수신
    window.electronTools.onUpdateStatus((data: UpdateStatus) => {
      setStatus(data.status);
      setMessage(data.message);
    });

    // 다운로드 진행률 수신
    window.electronTools.onDownloadProgress((data: UpdateProgress) => {
      setStatus("downloading");
      setProgress(data);
    });
  }, []);

  // 업데이트가 필요 없는 평상시에는 아무것도 렌더링하지 않음
  if (status === "idle" || status === "not-available") return null;

  return (
    <div className="update-overlay">
      <div className="update-card">
        <h3>{t("bitmap-app-update")}</h3>
        <Text as="p" className="message">
          {message}
        </Text>

        {status === "downloading" && progress && (
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <div className="progress-info">
              <span>{Math.round(progress.percent)}%</span>
              <span>
                {(progress.bytesPerSecond / 1024 / 1024).toFixed(1)} MB/s
              </span>
            </div>
          </div>
        )}

        {status === "downloaded" && (
          <button
            className="install-button"
            onClick={() => window.electronTools.quitAndInstall()}
          >
            {t("bitmap-app-update-now")}
          </button>
        )}

        {status === "error" && (
          <button className="close-button" onClick={() => setStatus("idle")}>
            {t("dismiss")}
          </button>
        )}
      </div>

      <style jsx>{`
        .update-overlay {
          position: fixed;
          bottom: 80px;
          right: 20px;
          z-index: 9999;
          width: 320px;
          background: #1e1e1e;
          border: 1px solid #333;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          color: white;
          padding: 16px;
          font-family: sans-serif;
        }
        .update-card h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
          color: #007bff;
        }
        .message {
          font-size: 14px;
          margin-bottom: 12px;
          color: #ccc;
        }
        .progress-bar {
          height: 6px;
          background: #333;
          border-radius: 3px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: #007bff;
          transition: width 0.3s ease;
        }
        .progress-info {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-top: 5px;
          color: #888;
        }
        .install-button {
          width: 100%;
          padding: 8px;
          background: #007bff;
          border: none;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        .install-button:hover {
          background: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default UpdateOverlay;
