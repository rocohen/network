# Generated by Django 3.1 on 2020-11-21 00:16

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0005_post_liked'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='post',
            name='liked',
        ),
    ]
