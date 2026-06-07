"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Admin() {
  const [session, setSession] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCaption, setEditCaption] = useState("");

  useEffect(() => {
    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      if (session) {
        fetchPhotos();
      } else {
        setPhotos([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      await supabase.auth.signOut();
      setSession(null);
      setPhotos([]);
      return;
    }

    setSession(data.session);

    if (data.session) {
      fetchPhotos();
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("Logging in...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("Login failed: " + error.message);
      return;
    }

    setSession(data.session);
    setMessage("Logged in successfully!");
    fetchPhotos();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
    setPhotos([]);
    setMessage("Logged out.");
  }

  async function fetchPhotos() {
    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Could not load photos: " + error.message);
      return;
    }

    setPhotos(data || []);
  }

  async function getNextSortOrder() {
    const { data, error } = await supabase
      .from("photos")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return 1;
    }

    return (data[0].sort_order || 0) + 1;
  }

  async function handleUpload(e) {
    e.preventDefault();
    setMessage("Uploading...");

    if (!file) {
      setMessage("Please choose a photo first.");
      return;
    }

    const safeFileName = file.name.replace(/\s+/g, "-").toLowerCase();
    const fileName = `${Date.now()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("portfolio-images")
      .upload(fileName, file);

    if (uploadError) {
      setMessage("Upload failed: " + uploadError.message);
      return;
    }

    const { data } = supabase.storage
      .from("portfolio-images")
      .getPublicUrl(fileName);

    const imageUrl = data.publicUrl;
    const nextSortOrder = await getNextSortOrder();

    const { error: dbError } = await supabase.from("photos").insert([
      {
        title: title,
        caption: caption,
        image_url: imageUrl,
        sort_order: nextSortOrder,
      },
    ]);

    if (dbError) {
      setMessage("Database save failed: " + dbError.message);
      return;
    }

    setMessage("Photo uploaded successfully!");
    setFile(null);
    setTitle("");
    setCaption("");

    await fetchPhotos();
  }

  async function handleDelete(photo) {
    const confirmDelete = window.confirm("Delete this photo?");
    if (!confirmDelete) return;

    setMessage("Deleting photo...");

    const imagePath = photo.image_url.split("/portfolio-images/")[1];

    if (imagePath) {
      await supabase.storage.from("portfolio-images").remove([imagePath]);
    }

    const { error } = await supabase
      .from("photos")
      .delete()
      .eq("id", photo.id);

    if (error) {
      setMessage("Delete failed: " + error.message);
      return;
    }

    setMessage("Photo deleted successfully!");
    await fetchPhotos();
  }

  function startEdit(photo) {
    setEditingId(photo.id);
    setEditTitle(photo.title || "");
    setEditCaption(photo.caption || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditCaption("");
  }

  async function saveEdit(photoId) {
    setMessage("Saving changes...");

    const { error } = await supabase
      .from("photos")
      .update({
        title: editTitle,
        caption: editCaption,
      })
      .eq("id", photoId);

    if (error) {
      setMessage("Update failed: " + error.message);
      return;
    }

    setMessage("Photo updated successfully!");
    setEditingId(null);
    setEditTitle("");
    setEditCaption("");

    await fetchPhotos();
  }

  async function movePhoto(index, direction) {
    const currentPhoto = photos[index];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const targetPhoto = photos[targetIndex];

    if (!currentPhoto || !targetPhoto) return;

    setMessage("Updating order...");

    const currentOrder = currentPhoto.sort_order || 0;
    const targetOrder = targetPhoto.sort_order || 0;

    const { error: errorOne } = await supabase
      .from("photos")
      .update({ sort_order: targetOrder })
      .eq("id", currentPhoto.id);

    if (errorOne) {
      setMessage("Move failed: " + errorOne.message);
      return;
    }

    const { error: errorTwo } = await supabase
      .from("photos")
      .update({ sort_order: currentOrder })
      .eq("id", targetPhoto.id);

    if (errorTwo) {
      setMessage("Move failed: " + errorTwo.message);
      return;
    }

    setMessage("Order updated.");
    await fetchPhotos();
  }

  if (!session) {
    return (
      <main className="page">
        <h1>Admin Login</h1>
        <p className="intro">Login to manage your portfolio photos.</p>

        <form className="admin-box" onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Your admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Your admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="button" type="submit">
            Login
          </button>

          {message && <p>{message}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="admin-header">
        <div>
          <h1>Admin</h1>
          <p className="intro">Upload and manage your portfolio photos.</p>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <form className="admin-box" onSubmit={handleUpload}>
        <h2>Photo Upload</h2>

        <label>Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <label>Title</label>
        <input
          type="text"
          placeholder="Photo title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>Caption</label>
        <textarea
          placeholder="Write photo caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        ></textarea>

        <button className="button" type="submit">
          Upload Photo
        </button>

        {message && <p>{message}</p>}
      </form>

      <section className="admin-gallery">
        <h2>Uploaded Photos</h2>

        {photos.length === 0 && <p>No uploaded photos yet.</p>}

        <div className="photo-grid">
          {photos.map((photo, index) => (
            <div className="photo-card" key={photo.id}>
              <img
                src={photo.image_url}
                alt={photo.title || "Portfolio photo"}
                className="gallery-img"
              />

              {editingId === photo.id ? (
                <div className="edit-box">
                  <label>Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />

                  <label>Caption</label>
                  <textarea
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                  ></textarea>

                  <div className="admin-actions">
                    <button
                      className="button"
                      type="button"
                      onClick={() => saveEdit(photo.id)}
                    >
                      Save
                    </button>

                    <button
                      className="cancel-button"
                      type="button"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {photo.title && <h3>{photo.title}</h3>}
                  {photo.caption && <p>{photo.caption}</p>}

                  <div className="admin-actions">
                    <button
                      className="edit-button"
                      type="button"
                      onClick={() => movePhoto(index, "up")}
                      disabled={index === 0}
                    >
                      ↑
                    </button>

                    <button
                      className="edit-button"
                      type="button"
                      onClick={() => movePhoto(index, "down")}
                      disabled={index === photos.length - 1}
                    >
                      ↓
                    </button>
                  </div>

                  <div className="admin-actions">
                    <button
                      className="edit-button"
                      type="button"
                      onClick={() => startEdit(photo)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      type="button"
                      onClick={() => handleDelete(photo)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}