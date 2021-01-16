from cryptbox.database import db

from .directories import Directories

from ..aliases import *

from ..size_constants.files import *

class Files:
    __tablename__ = "files"

    id = dbcol(dbint, primary_key = True)
    
    owner = dbcol(dbint, dbforkey("users.id"))

    parent = dbcol(dbint, dbforkey(Directories.id), nullable = False)

    encrypted_name = dbcol(dbstr(NAME_MAX_LENGTH), nullable = False)
    name_iv = dbcol(dbstr(IV_LENGTH), nullable = False, unique = True)
