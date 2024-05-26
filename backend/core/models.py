from django.db import models
from accounts.models import User

class Listing(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.CharField(max_length=255)
    type = models.CharField(max_length=255)
    street_address = models.CharField(max_length=255)
    apt_suite = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    province = models.CharField(max_length=255)
    country = models.CharField(max_length=255)
    guest_count = models.IntegerField()
    bedroom_count = models.IntegerField()
    bed_count = models.IntegerField()
    bathroom_count = models.IntegerField()
    amenities = models.JSONField(default=list)
    listing_photo_paths = models.JSONField(default=list)
    title = models.CharField(max_length=255)
    description = models.TextField()
    highlight = models.CharField(max_length=255)
    highlight_desc = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Booking(models.Model):
    customer = models.ForeignKey(User, related_name='customer_bookings', on_delete=models.CASCADE)
    host = models.ForeignKey(User, related_name='host_bookings', on_delete=models.CASCADE)
    listing = models.ForeignKey(Listing, related_name='bookings', on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Booking {self.id}: {self.customer} -> {self.listing} from {self.start_date} to {self.end_date}"
