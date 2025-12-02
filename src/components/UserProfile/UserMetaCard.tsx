import { useState, useEffect } from "react";
import { UserIcon, PencilIcon } from "@heroicons/react/24/solid";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { supabase } from "../../lib/supabase";
import { UserDetail } from "../../hooks/useUserDetail";
import heic2any from "heic2any";
import { useToast } from "../ui/Toast";

type UserMetaCardProps = {
  userDetail: UserDetail;
  onUpdate?: (updated: Partial<UserDetail>) => void;
};

export default function UserMetaCard({
  userDetail,
  onUpdate,
}: UserMetaCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(userDetail.name);
  const [email, setEmail] = useState(userDetail.email);
  const [phone, setPhone] = useState(userDetail.phone ?? "");
  const [photoUrl, setPhotoUrl] = useState(userDetail.userphotoUrl ?? "");
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { addToast } = useToast();

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  useEffect(() => {
    setName(userDetail.name);
    setEmail(userDetail.email);
    setPhone(userDetail.phone ?? "");
    setPhotoUrl(userDetail.userphotoUrl ?? "");
    setNewPhotoFile(null);
  }, [userDetail]);

  // Resize de imagens grandes
  const resizeImage = async (file: File, maxSizeMB = 5): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const scaleFactor = Math.sqrt((maxSizeMB * 1024 * 1024) / file.size);
          if (scaleFactor < 1) {
            width = width * scaleFactor;
            height = height * scaleFactor;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob)
                resolve(new File([blob], file.name, { type: file.type }));
              else reject("Erro ao processar a imagem");
            },
            file.type,
            0.8
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handlePhotoChange = async (file: File) => {
    // HEIC → JPEG
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (
      file.type.includes("heic") ||
      file.type.includes("heif") ||
      ext === "heic" ||
      ext === "heif"
    ) {
      try {
        const result = await heic2any({ blob: file, toType: "image/jpeg" });
        const blob = Array.isArray(result) ? result[0] : result;
        file = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
          type: "image/jpeg",
        });
      } catch {
        addToast("Não foi possível converter HEIC/HEIF", "error");
        return;
      }
    }

    if (file.size > 50 * 1024 * 1024) {
      try {
        file = await resizeImage(file, 50);
        if (file.size > 50 * 1024 * 1024) {
          addToast("Imagem demasiado grande", "error");
          return;
        }
      } catch {
        addToast("Não foi possível processar a imagem", "error");
        return;
      }
    }

    setNewPhotoFile(file);
    setPhotoUrl(URL.createObjectURL(file));
  };

  const handleSavePhoto = async () => {
    if (!newPhotoFile) return;
    setUploading(true);

    const filePath = `users/${userDetail.id}`;
    const { error: uploadError } = await supabase.storage
      .from("PhotosUrls")
      .upload(filePath, newPhotoFile, {
        upsert: true,
        contentType: newPhotoFile.type,
      });

    if (uploadError) {
      addToast("Erro ao importar imagem", "error");
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("PhotosUrls")
      .getPublicUrl(filePath);
    const newPhotoUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
    setPhotoUrl(newPhotoUrl);
    setNewPhotoFile(null);
    setUploading(false);

    const { error: updateError } = await supabase
      .from("User_detail")
      .update({ userphotoUrl: newPhotoUrl })
      .eq("id", userDetail.id);

    if (updateError) {
      addToast("Erro ao atualizar foto", "error");
      return;
    }
    addToast("Foto atualizada com sucesso", "success");
  };

  const handleSaveDetails = async () => {
    const { error } = await supabase
      .from("User_detail")
      .update({ name, phone: phone || null })
      .eq("id", userDetail.id);
    if (error) {
      addToast("Erro ao atualizar dados", "error");
    } else {
      onUpdate?.({ name, phone });
      closeModal();
      addToast("Dados atualizados com sucesso", "success");
    }
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
        {/* Foto e info */}
        <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:gap-6 w-full">
          <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 relative">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="user"
                className="object-cover w-full h-full rounded-full border"
              />
            ) : (
              <div className="w-full h-full rounded-full border flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                <UserIcon className="h-10 w-10 text-gray-400" />
              </div>
            )}
            <label className="absolute bottom-1 right-2 bg-gray-200 dark:bg-gray-700 rounded-full p-1 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoChange(file);
                }}
              />
              <PencilIcon className="h-4 w-4 text-gray-800 dark:text-white" />
            </label>
          </div>

          <div className="flex flex-col gap-1 text-center lg:text-left">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {name}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{email}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {phone || "Sem número"}
            </p>
          </div>
        </div>

        {/* Botões */}
        <div className="flex items-center gap-2 mt-4 justify-center lg:mt-0 lg:ml-4 lg:justify-end">
          <Button variant="outline" size="sm" onClick={openModal}>
            Editar
          </Button>
          {newPhotoFile && (
            <Button
              size="sm" // ✅ igual ao de Editar
              className="bg-green-500 hover:bg-green-600"
              onClick={handleSavePhoto}
              disabled={uploading}
            >
              Guardar Foto
            </Button>
          )}
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
        <div className="relative w-full overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900">
          <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
            Editar Dados
          </h4>
          <div className="flex flex-col gap-4">
            <div>
              <Label>Nome</Label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="text" disabled value={email} />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button onClick={handleSaveDetails}>Guardar</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
