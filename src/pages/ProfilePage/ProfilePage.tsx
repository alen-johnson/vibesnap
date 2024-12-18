import "./ProfilePage.css";
import { PlusOutlined } from "@ant-design/icons";
import { Button, FloatButton, Modal, Skeleton } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import useLogout from "../../hooks/useLogout";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../services/firebase";
import useAuthStore from "../../store/authStore";
import { ProfileHeader } from "../../components/componetIndex";
import { cover, profile } from "../../assets/imageIndex";
import useGetProfileByUsername from "../../hooks/useGetProfileByUsername";
import useFollowUser from "../../hooks/useFollowUser";

function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { handleLogout, isLoggingOut } = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const [user] = useAuthState(auth);
  const authUser = useAuthStore((state) => state.user);

  const { userProfile, isloading } = useGetProfileByUsername(username || "");
  const { isFollowing, isUpdating, handleFollowUser } = useFollowUser(userProfile?.uid ?? "");

  const isOwnProfile = authUser?.username === username;

  const handleLogoutAndNavigate = async () => {
    await handleLogout();
    navigate("/auth");
  };

  const arrowClick = () => {
    navigate("/");
  };

  const handleEdit = () => {
    navigate(`/edit/${authUser?.username}`);
  };

  if (isloading) {
    return (
      <div className="loading">
        <Skeleton.Image active style={{ width: 200, height: 200 }} />
        <Skeleton.Avatar
          active
          size={"large"}
          style={{ width: 200, height: 200 }}
        />
        <Skeleton paragraph={{ rows: 4 }} active />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="not-found">
        <h1>404</h1>
        <p>Profile not found!</p>
      </div>
    );
  }

  const coverimg = userProfile.coverPicURL ? userProfile.coverPicURL : cover;
  const profileimg = userProfile.profilePicURL
    ? userProfile.profilePicURL
    : profile;

  return (
    <div className="profile">
      <ProfileHeader
        text="Go Back"
        showButtons={isOwnProfile && user !== null}
        onArrowClick={arrowClick}
        onLogoutClick={() => setIsOpen(!isOpen)}
        isLoggingOut={isLoggingOut}
        coverImage={coverimg}
        profileImage={profileimg}
      />
      <div className="profile__head">
        {isOwnProfile && (
          <Button onClick={handleEdit} className="profile__head-edtbtn">
            Edit Profile
          </Button>
        )}
        {!isOwnProfile && (
          <Button
            onClick={handleFollowUser}
            type="primary"
            className="profile__head-edtbtn"
            loading={isUpdating}
          >
            {!isFollowing ? "Follow" : "Unfollow"}
          </Button>
        )}
      </div>
      <div className="profile__bio">
        <h2>{userProfile.fullname}</h2>
        <p>{userProfile.bio}</p>
      </div>
      <div className="profile__posts">
        <h4>My Posts</h4>

        <Modal
          open={isOpen}
          onOk={handleLogoutAndNavigate}
          onCancel={() => setIsOpen(!isOpen)}
          title="Are you sure you want to log out?"
        />
      </div>
      {isOwnProfile && <FloatButton icon={<PlusOutlined />} type="primary" />}
    </div>
  );
}

export default ProfilePage;
