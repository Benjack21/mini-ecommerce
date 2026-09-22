from ..models import Notification

def get_user_notifications(user, limit=20):
    """[FASE 2.1] Obtiene notificaciones recientes."""
    notifications = Notification.objects.filter(user=user).order_by('-created_at')[:limit]
    return [
        {
            'id': n.id,
            'message': n.message,
            'read': n.read,
            'created_at': n.created_at.strftime('%d/%m/%Y %H:%M')
        }
        for n in notifications
    ]

def mark_all_notifications_read(user):
    """[FASE 2.1] Marca todas las notificaciones como leídas."""
    Notification.objects.filter(user=user, read=False).update(read=True)
    return True
