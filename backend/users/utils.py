def get_pclaim(user):
    try:
        claim = user.password[-10:]
        bclaim = claim.encode("utf-8")
        pclaim = str(int.from_bytes(bclaim, "big"))
        return pclaim
    except Exception as e:
        print(e)
        return None
