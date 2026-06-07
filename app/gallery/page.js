"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [message, setMessage] = useState("Loading photos...");
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    async function fetchPhotos() {
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setMessage("Could not load photos: " + error.message);
        return;
      }

      setPhotos(data || []);
      setMessage("");
    }

    fetchPhotos();
  }, []);

  function openPhoto(photo) {
    setSelectedPhoto(photo);
  }

  function closePhoto() {
    setSelectedPhoto(null);
  }

  return (
    <main className="page">
      <h1>Gallery</h1>

      {message && <p>{message}</p>}

      {photos.length === 0 && !message && <p>No photographs uploaded yet.</p>}

      <section className="photo-grid">
        {photos.map((photo) => (
          <div className="photo-card" key={photo.id}>
            <button
              className="image-button"
              onClick={() => openPhoto(photo)}
              type="button"
            >
              <img
                src={photo.image_url}
                alt={photo.title || "Portfolio photo"}
                className="gallery-img"
              />
            </button>

            {photo.title && <h3>{photo.title}</h3>}
            {photo.caption && <p>{photo.caption}</p>}
          </div>
        ))}
      </section>

      {selectedPhoto && (
        <div className="lightbox" onClick={closePhoto}>
          <button className="lightbox-close" onClick={closePhoto}>
            ×
          </button>

          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedPhoto.image_url}
              alt={selectedPhoto.title || "Portfolio photo"}
              className="lightbox-img"
            />

            {(selectedPhoto.title || selectedPhoto.caption) && (
              <div className="lightbox-text">
                {selectedPhoto.title && <h2>{selectedPhoto.title}</h2>}
                {selectedPhoto.caption && <p>{selectedPhoto.caption}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}