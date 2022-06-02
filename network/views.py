import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.core.paginator import Paginator
from django.shortcuts import render
from django.urls import reverse
from itertools import chain


from .models import User, Post, Profile
from .forms import ProfileSettingsForm, PostForm

def index(request):
    posts = Post.objects.all()
    if request.user.is_authenticated:
        profile = Profile.objects.get(user=request.user)
    else:
        profile = None
   
    # Creating a new post
    if request.method == 'POST':
        post_form = PostForm(request.POST)
        if post_form.is_valid():
            new_post = post_form.save(commit=False)
            new_post.author = request.user
            new_post.save()
            return HttpResponseRedirect(reverse("index"))

    post_form = PostForm()
    # Paginator
    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    posts = paginator.get_page(page_number)
    
    
    context = { 
        "post_form": post_form,
        "posts": posts,
        "profile": profile,
        
        }
    return render(request, "network/index.html", context)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@login_required(login_url='login')
def profile_view(request, user_id):
    current_user = Profile.objects.get(user=user_id) 
    posts = Post.objects.filter(author=user_id).all()
    my_profile = Profile.objects.get(user=request.user)
    users_following = current_user.following.all()
    followers = Profile.objects.filter(following=current_user.user).all()
    likes_given = my_profile.user.likes.all().count()
    current_user_likes = current_user.user.likes.all().count()
    
    logged_in_user = None
    userId = user_id

    # Following / Unfollowing user
    if request.method == 'POST':
        if current_user.user in my_profile.following.all():
            my_profile.following.remove(current_user.user)
        else: 
            my_profile.following.add(current_user.user)
        return HttpResponseRedirect(reverse("profile", args=(user_id, )))

    # Check if user is in my list of follows
    if current_user.user in my_profile.following.all():
        following = True
    else:
        following = False
    
    
    if request.user.id == user_id:
        logged_in_user = request.user.id

    # Paginator
    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    posts = paginator.get_page(page_number)
    
    
    
    context = {
        "posts": posts,
        "current_user": current_user,
        "logged_in_user": logged_in_user,
        "following": following,
        "userId": userId,
        "users_following": users_following,
        "followers": followers,
        "my_profile": my_profile,
        "likes_given": likes_given,
        "current_user_likes": current_user_likes
    }
    return render(request, "network/profile-page.html", context)


@login_required(login_url='login')
def following_view(request):
    # Logged in user profile
    my_profile = Profile.objects.get(user=request.user)

    # check who we are following
    users = [user for user in my_profile.following.all()]
    
    posts = []
    qs = None

    # get posts of people we are following
    for user in users:
        user_posts = Post.objects.filter(author=user).all()
        posts.append(user_posts)

    # Sort and chain queryset
    if len(posts) > 0:
        qs = sorted(chain(*posts), reverse=True, key=lambda post: post.post_date)
    
        # Paginator
        paginator = Paginator(qs, 10)
        page_number = request.GET.get('page')
        qs = paginator.get_page(page_number)

    
    context = {
        "posts": qs,
        "my_profile": my_profile
    }
    return render(request, "network/following.html", context)
    

@login_required(login_url='login')
def settings_view(request):
    if request.method == 'POST':
        profile_form = ProfileSettingsForm(request.POST, request.FILES, instance=request.user.profile)

        if profile_form.is_valid():
            profile_form.save()
            messages.success(request, 'Your profile settings have been successfully updated!')
            return HttpResponseRedirect(reverse("settings"))

    profile_form = ProfileSettingsForm(instance=request.user.profile)
    
    context = {
        'profile_form': profile_form,
    }
    return render(request, "network/profile-settings.html", context)

@login_required(login_url='login')
def get_likes(request):
    user = request.user
    if request.method == 'POST':
        data = json.loads(request.body)
        post_id = data.get('post_id')
        
        if post_id is not None:
            post = Post.objects.get(id=post_id)
            profile = Profile.objects.get(user=user)

            if profile.user in post.likes.all():
                post.likes.remove(profile.user)
            else:
                post.likes.add(profile.user)


            data = {   
                'likes': post.likes.all().count(),  
            }

            return JsonResponse(data, safe=False)

    return render(request, "network/index.html") 


@login_required(login_url='login')   
def edit_post(request):
    user = request.user
    if request.method == 'POST':
        data = json.loads(request.body)
        post_id = data.get('post_ID')
        post_body = data.get('post_body')
        # Update post
        if post_body and post_id is not None:
            Post.objects.filter(id=post_id, author=user).update(body=post_body) 
            post = Post.objects.get(id=post_id)          

        data = {   
                'post': post.body
            }

        return JsonResponse(data, safe=False)

    return render(request, "network/index.html") 


