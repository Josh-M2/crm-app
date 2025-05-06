import { User } from "@heroui/react";

type UserAvatarType = {
  description: string;
  name: string;
};

export default function UserAvatar({ description, name }: UserAvatarType) {
  return (
    <User
      avatarProps={{
        src: "https://i.pravatar.cc/150?u=a04258114e29026702d",
      }}
      description={description}
      name={name}
    />
  );
}
