def save_avatar(backend, user, response, *args, **kwargs):
    if backend.name == 'github' and not user.avatar_url:
        user.avatar_url = response.get('avatar_url', '')
        if not user.name:
            user.name = response.get('name') or response.get('login', '')
        user.save()
