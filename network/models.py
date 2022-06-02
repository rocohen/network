from django.contrib.auth.models import AbstractUser
from django.db import models
from PIL import Image

class User(AbstractUser):
    pass

class Profile(models.Model):
    user = models.OneToOneField(User, null=True, on_delete=models.CASCADE)
    image = models.ImageField(blank=True, default="default_pic.jpg", upload_to="profile_pics")
    biography = models.CharField(max_length=230, blank=True)
    location = models.CharField(max_length=150, blank=True)
    website = models.CharField(max_length=150, blank=True)
    following = models.ManyToManyField(User, blank=True, related_name='following')
    likes = models.ManyToManyField(User, blank=True, related_name="user_likes")

    def __str__(self):
        return f"{self.user.username} Profile"

    def save(self, *args, **kwargs):
        super(Profile, self).save(*args, **kwargs)

        img = Image.open(self.image.path)

        if img.height > 128 or img.width > 128:
            output_size = (128, 128)
            img.thumbnail(output_size)


class Post(models.Model):
    body = models.TextField(max_length=200)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    likes = models.ManyToManyField(User, blank=True, related_name="likes")
    post_date = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"Post made by {self.author} on {self.post_date}"
    
    class Meta:
        ordering = ('-post_date', )