from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ListingViewSet, BookingViewSet, ListingSearchView

router = DefaultRouter()
router.register(r'listings', ListingViewSet)
router.register(r'bookings', BookingViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('listings/search/<str:search>/', ListingSearchView.as_view(), name='listing-search'),
]
