import { User } from "@heroui/react";
import { FaRegUserCircle } from "react-icons/fa";

type UserAvatarType = {
  description: string;
  name: string;
  imageSrc?: string | null;
};

export default function UserAvatar({
  description,
  imageSrc,
  name,
}: UserAvatarType) {
  return (
    <User
      avatarProps={{
        icon: <FaRegUserCircle className="text-xl text-gray-500" />,
        name,
        src: imageSrc || undefined,
      }}
      description={description}
      name={name}
    />
  );
}
