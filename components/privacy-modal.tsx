"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

export function PrivacyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [canPortal, setCanPortal] = useState(false);
  const titleId = useId();

  useEffect(() => {
    setCanPortal(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button className="privacy-link" type="button" onClick={() => setIsOpen(true)}>
        Privacy
      </button>

      {isOpen && canPortal ? createPortal(
        <div className="privacy-modal" role="presentation" onMouseDown={() => setIsOpen(false)}>
          <section
            aria-labelledby={titleId}
            aria-modal="true"
            className="privacy-modal-panel"
            role="dialog"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="privacy-modal-header">
              <h2 id={titleId}>Privacy</h2>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close privacy note">
                <svg aria-hidden="true" viewBox="0 0 16 16">
                  <path d="M4.2 4.2 11.8 11.8M11.8 4.2 4.2 11.8" />
                </svg>
              </button>
            </div>
            <p>
              This site uses a few public and playful features: reactions, public message board posts,
              anonymous cursor presence, local browser storage, and Uno chat requests. Please do not share
              private or sensitive information in messages or chat.
            </p>
            <p>
              Message board posts are public. Uno chat messages are sent to an AI endpoint. If you want a
              public message removed, email <a href="mailto:rvguitard@gmail.com">rvguitard@gmail.com</a>.
            </p>
          </section>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
