'use client';

import React from 'react';
import { Heart, MessageCircle, Star, Check } from 'lucide-react';
import { useNotifications, type Notification } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
}

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const { markAsRead } = useNotifications();

  const handleClick = async () => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    onClose();
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'review_like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'review_comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'new_review':
        return <Star className="w-5 h-5 text-yellow-500" />;
      default:
        return <Star className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTimeAgo = () => {
    try {
      return formatDistanceToNow(new Date(notification.created_at), {
        addSuffix: true,
        locale: th,
      });
    } catch (error) {
      return 'เมื่อไหร่ก็ไม่รู้';
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
        !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {getTimeAgo()}
              </p>
            </div>

            {/* Read indicator */}
            <div className="flex-shrink-0 ml-2">
              {!notification.is_read ? (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              ) : (
                <Check className="w-4 h-4 text-green-500" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}