"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [message, setMessage] = useState("Loading photos...");

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

      setPhotos(data);
      setMessage("");
    }

    fetchPhotos();
  }, []);

  return (
    <main className="page">
      <h1>Gallery</h1>

      {message && <p>{message}</p>}

      <section className="photo-grid">
        {photos.map((photo) => (
          <div className="photo-card" key={photo.id}>
            <img
              src={photo.image_url}
              alt={photo.title || "Portfolio photo"}
              className="gallery-img"
            />
            <h3>{photo.title || "Untitled"}</h3>
            <p>{photo.caption || ""}</p>
          </div>
        ))}
      </section>
    </main>
  );
}