from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer, OrderCreateSerializer


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj.user == request.user


class OrderListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/orders/  -> admin sees all orders, normal users see only their own
    POST /api/orders/  -> create an order (checkout) from cart items
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=user)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OrderCreateSerializer
        return OrderSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order, context={'request': request}).data, status=201)


class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/orders/<id>/  -> view order (owner or admin)
    PATCH  /api/orders/<id>/  -> update status (admin only, enforced below)
    DELETE /api/orders/<id>/  -> cancel/delete order (admin only, enforced below)
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def update(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {'detail': 'Only admins can update order status.'}, status=403
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {'detail': 'Only admins can delete orders.'}, status=403
            )
        return super().destroy(request, *args, **kwargs)
