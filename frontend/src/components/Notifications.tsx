import { TrashIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { classNames } from ".";

const notifications: Notification[] = [
  {
    id: 1,
    message: "This is a test notification",
    time: "From some time ago",
    read: false,
  },
];

type Notification = {
  id: number;
  message: string;
  time: string;
  read: boolean;
};

type NotificationProps = Notification & {
  onDelete: (id: number) => void;
};

const NotificationRow: React.FC<NotificationProps> = ({
  id,
  message,
  time,
  read,
  onDelete,
}) => {
  return (
    <div
      className={classNames("flex items-center justify-between px-4 py-3", {
        "bg-gray-800": !read,
      })}
    >
      <div className="flex items-center">
        <div
          className={classNames(
            "flex h-8 w-8 items-center justify-center rounded-full",
            { "bg-yellow-500": !read, "bg-gray-600": read }
          )}
        >
          <TrashIcon className="block h-6 w-6" aria-hidden="true" />
        </div>
        <div className="ml-4">
          <p
            className={classNames("text-sm font-medium", {
              "text-white": !read,
              "text-gray-300": read,
            })}
          >
            {message}
          </p>
          <p
            className={classNames("mt-1 text-xs", {
              "text-gray-400": read,
            })}
          >
            {time}
          </p>
        </div>
      </div>
      <button
        onClick={() => onDelete(id)}
        className="ml-2 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
      >
        <TrashIcon className="block h-6 w-6" aria-hidden="true" />
      </button>
    </div>
  );
};

const Notifications = () => {
  const [notificationsList, setNotificationsList] =
    useState<Notification[]>(notifications);

  const handleDeleteNotification = (id: number) => {
    const updatedList = notificationsList.filter(
      (notification) => notification.id !== id
    );
    setNotificationsList(updatedList);
  };

  const handleClearAllNotifications = () => {
    setNotificationsList([]);
  };

  return (
    <div className="flex min-h-screen w-full flex-col p-4 md:p-12">
      <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
      <div className="mt-8 space-y-8 rounded bg-gray-900 p-8">
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                id={notification.id}
                message={notification.message}
                time={notification.time}
                read={notification.read}
                onDelete={handleDeleteNotification}
              />
            ))}
            <div className="flex justify-end">
              <button
                onClick={handleClearAllNotifications}
                className="text-sm text-gray-400 hover:text-gray-200"
              >
                Clear all notifications
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-100">
            You have no notifications.
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
