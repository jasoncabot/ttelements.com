import {
  ArchiveBoxIcon,
  BellAlertIcon,
  CheckCircleIcon,
  CogIcon,
  InboxIcon,
  InformationCircleIcon,
  TrashIcon,
  UserGroupIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { classNames } from ".";

// --- Mock API --- (Replace with actual API calls)
const MOCK_DELAY = 500; // Simulate network latency

let mockNotifications: Notification[] = [
  {
    id: 1,
    message: "Your weekly summary is ready.",
    time: "2 hours ago",
    read: false,
    type: "summary",
  },
  {
    id: 2,
    message: "New card pack 'Ancient Wonders' released!",
    time: "1 day ago",
    read: false,
    type: "announcement",
  },
  {
    id: 3,
    message: "Friend request from PlayerX123",
    time: "3 days ago",
    read: true,
    type: "social",
  },
  {
    id: 4,
    message: "Maintenance scheduled for tomorrow at 03:00 UTC",
    time: "4 days ago",
    read: true,
    type: "system",
  },
];

const fetchNotificationsAPI = async (): Promise<Notification[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(mockNotifications))); // Deep copy
    }, MOCK_DELAY);
  });
};

const deleteNotificationAPI = async (id: number): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockNotifications.findIndex((n) => n.id === id);
      if (index > -1) {
        mockNotifications.splice(index, 1);
        resolve(true);
      } else {
        resolve(false);
      }
    }, MOCK_DELAY / 2);
  });
};

const markAsReadAPI = async (id: number): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const notification = mockNotifications.find((n) => n.id === id);
      if (notification) {
        notification.read = true;
        resolve(true);
      } else {
        resolve(false);
      }
    }, MOCK_DELAY / 3);
  });
};

const clearAllNotificationsAPI = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockNotifications = [];
      resolve(true);
    }, MOCK_DELAY);
  });
};

const markAllAsReadAPI = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockNotifications.forEach((n) => (n.read = true));
      resolve(true);
    }, MOCK_DELAY / 2);
  });
};
// --- End Mock API ---

type Notification = {
  id: number;
  message: string;
  time: string;
  read: boolean;
  type: "summary" | "announcement" | "social" | "system" | "generic"; // Example types
};

type NotificationProps = Notification & {
  onDelete: (id: number) => void;
  onMarkRead: (id: number) => void;
  isDeleting: boolean; // Added for animation
};

// Map notification types to icons
const notificationIcons: Record<Notification["type"], React.ElementType> = {
  summary: ArchiveBoxIcon,
  announcement: InformationCircleIcon,
  social: UserGroupIcon,
  system: CogIcon,
  generic: BellAlertIcon,
};

const NotificationRow: React.FC<NotificationProps> = ({
  id,
  message,
  time,
  read,
  type,
  onDelete,
  onMarkRead,
  isDeleting, // Added
}) => {
  // Determine the main icon based on type, fallback to BellAlertIcon
  const TypeIcon = notificationIcons[type] || BellAlertIcon;
  // Determine the status icon based on read state
  const StatusIcon = (
    read ? CheckCircleIcon : TypeIcon
  ) as typeof CheckCircleIcon; // Show type icon if unread, check if read

  return (
    <div
      className={classNames(
        "group flex items-center justify-between px-4 py-3 transition-all duration-300 ease-in-out",
        read
          ? "bg-gray-800/50 hover:bg-gray-700/60"
          : "bg-gradient-to-r from-gray-700/80 to-gray-800/70 hover:from-gray-600/80 hover:to-gray-700/70 hover:shadow-md",
        read ? "cursor-default" : "cursor-pointer", // Only clickable if unread
        isDeleting ? "scale-95 opacity-0" : "scale-100 opacity-100", // Deletion animation
      )}
      onClick={() => !read && onMarkRead(id)} // Mark as read on click if unread
      style={{ transitionDuration: isDeleting ? "300ms" : "150ms" }} // Faster transition for non-delete actions
    >
      <div className="mr-4 flex min-w-0 flex-1 items-center">
        {" "}
        {/* Allow shrinking */}
        <div
          className={classNames(
            "mr-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-300",
            // Use distinct colors for read/unread status, maybe tied to type later
            read ? "bg-gray-600 text-gray-400" : "bg-amber-500 text-white",
          )}
        >
          {/* Use StatusIcon which changes based on read state */}
          <StatusIcon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          {" "}
          {/* Prevent text overflow issues */}
          <p
            className={classNames(
              "truncate text-sm font-medium transition-colors duration-300", // Add truncate & transition
              read ? "text-gray-400" : "text-white", // Dim text when read
            )}
          >
            {message}
          </p>
          <p
            className={classNames(
              "mt-1 text-xs transition-colors duration-300",
              read ? "text-gray-500" : "text-gray-400",
            )}
          >
            {time}
          </p>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent onClick on parent div
          onDelete(id);
        }}
        className="ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-gray-500 opacity-0 transition-all duration-150 group-hover:opacity-100 hover:text-red-500 focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none" // Fade in on row hover
        aria-label="Delete notification"
      >
        <TrashIcon className="h-5 w-5 cursor-pointer" aria-hidden="true" />
      </button>
    </div>
  );
};

// Simple Skeleton Loader Row
const SkeletonRow = () => (
  <div className="flex animate-pulse items-center px-4 py-3">
    <div className="mr-4 h-8 w-8 flex-shrink-0 rounded-full bg-gray-700"></div>
    <div className="min-w-0 flex-1 space-y-2">
      <div className="h-4 w-3/4 rounded bg-gray-700"></div>
      <div className="h-3 w-1/2 rounded bg-gray-700"></div>
    </div>
    <div className="ml-2 h-8 w-8 flex-shrink-0 rounded-full bg-gray-700"></div>
  </div>
);

const Notifications = () => {
  const [notificationsList, setNotificationsList] = useState<Notification[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set()); // Track deleting items

  // ... fetchNotifications, useEffect ... (no changes needed here)
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchNotificationsAPI();
      setNotificationsList(data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Failed to load notifications. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleDeleteNotification = async (id: number) => {
    // Add to deleting set for animation
    setDeletingIds((prev) => new Set(prev).add(id));

    // Wait for animation before removing from state and calling API
    setTimeout(async () => {
      const originalList = notificationsList; // Capture list *before* filtering
      setNotificationsList((currentList) =>
        currentList.filter((n) => n.id !== id),
      );

      try {
        const success = await deleteNotificationAPI(id);
        if (!success) {
          // Revert if API call failed - put item back without animation
          setNotificationsList(originalList);
          setError("Failed to delete notification.");
        }
      } catch (err) {
        console.error("Failed to delete notification:", err);
        setNotificationsList(originalList); // Revert on error
        setError("Failed to delete notification.");
      } finally {
        // Remove from deleting set regardless of success/failure
        setDeletingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    }, 300); // Match animation duration
  };

  const handleMarkAsRead = async (id: number) => {
    // Find the notification to potentially revert
    const notificationToUpdate = notificationsList.find((n) => n.id === id);
    if (!notificationToUpdate || notificationToUpdate.read) return; // Already read or not found

    const originalList = [...notificationsList]; // Keep original for revert
    // Optimistic update
    setNotificationsList(
      notificationsList.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

    try {
      const success = await markAsReadAPI(id);
      if (!success) {
        setNotificationsList(originalList); // Revert
        setError("Failed to mark notification as read.");
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      setNotificationsList(originalList); // Revert
      setError("Failed to mark notification as read.");
    }
  };

  const handleClearAllNotifications = async () => {
    const originalList = [...notificationsList];
    // Animate all out (optional, could just clear instantly)
    const idsToAnimate = new Set(notificationsList.map((n) => n.id));
    setDeletingIds(idsToAnimate);

    setTimeout(async () => {
      setNotificationsList([]); // Clear list after animation starts
      try {
        const success = await clearAllNotificationsAPI();
        if (!success) {
          setNotificationsList(originalList);
          setError("Failed to clear notifications.");
        }
      } catch (err) {
        console.error("Failed to clear notifications:", err);
        setNotificationsList(originalList);
        setError("Failed to clear notifications.");
      } finally {
        setDeletingIds(new Set()); // Clear deleting state
      }
    }, 300); // Animation duration
  };

  const handleMarkAllRead = async () => {
    const originalList = [...notificationsList];
    // Optimistic update
    setNotificationsList(notificationsList.map((n) => ({ ...n, read: true })));
    try {
      const success = await markAllAsReadAPI();
      if (!success) {
        setNotificationsList(originalList);
        setError("Failed to mark all notifications as read.");
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      setNotificationsList(originalList);
      setError("Failed to mark all notifications as read.");
    }
  };

  // Memoize calculation
  const hasUnread = useMemo(
    () => notificationsList.some((n) => !n.read),
    [notificationsList],
  );
  const hasNotifications = notificationsList.length > 0;

  return (
    <div className="flex min-h-screen w-full flex-col p-4 text-gray-300 md:p-12">
      <div className="mb-8 flex items-center justify-between rounded-lg bg-gray-800/50 p-4 shadow-md">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Notifications
        </h1>
        <div
          className={classNames(
            "flex space-x-4 transition-opacity duration-300",
            hasNotifications ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <button
            onClick={handleMarkAllRead}
            className={classNames(
              "cursor-pointer rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow transition-all duration-150 hover:bg-amber-400 focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none",
              hasUnread ? "opacity-100" : "pointer-events-none opacity-0",
            )}
            disabled={!hasUnread}
          >
            Mark all as read
          </button>
          <button
            onClick={handleClearAllNotifications}
            className="cursor-pointer rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-amber-500 shadow transition-all duration-150 hover:bg-gray-700 hover:text-amber-400 focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"
          >
            Clear all
          </button>
        </div>
      </div>
      <div
        className={classNames(
          "overflow-hidden transition-all duration-300 ease-in-out",
          error ? "mb-4 max-h-20 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        {error && (
          <div className="flex items-center justify-center rounded border border-amber-700 bg-amber-900/30 p-4 text-center text-amber-200">
            <XCircleIcon className="mr-2 h-5 w-5 flex-shrink-0 text-amber-400" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-amber-300 hover:text-white"
            >
              <XCircleIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      <div className="overflow-hidden rounded-xl bg-gray-900 shadow-2xl ring-1 ring-gray-800">
        {isLoading ? (
          <div className="divide-y divide-gray-800">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : hasNotifications || deletingIds.size > 0 ? (
          <div className="divide-y divide-gray-800">
            {notificationsList.map((notification) => (
              <NotificationRow
                key={notification.id}
                {...notification}
                onDelete={handleDeleteNotification}
                onMarkRead={handleMarkAsRead}
                isDeleting={deletingIds.has(notification.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4 p-10 text-center text-gray-500">
            <InboxIcon className="h-16 w-16 text-amber-500" />
            <p className="text-lg text-gray-300">All caught up!</p>
            <p className="text-sm text-gray-400">
              You have no new notifications.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
