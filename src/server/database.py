from peewee import *
from playhouse.sqlite_ext import SqliteExtDatabase, AutoIncrementField, JSONField

import datetime
import uuid

# Connect to local database
db = SqliteExtDatabase('NeuroX.db', pragmas=(
    ('cache_size', -1024 * 64),  # 64MB page-cache.
    ('journal_mode', 'wal'),  # Use WAL-mode (you should always use this!).
    ('foreign_keys', 1))  # Enforce foreign-key constraints.
)

class Project(Model):
	id = UUIDField(primary_key=True)
	projectName = TextField()
	creationDate = DateTimeField(default=datetime.datetime.now)
	modelPath = TextField()
	textPath = TextField()
	mtTestPath = TextField()
	mtReferencePath = TextField()
	outputStyler = TextField()
	store = JSONField(default={})

	class Meta:
		database = db

class Ranking(Model):
	id = AutoIncrementField()
	project = ForeignKeyField(Project)
	type = TextField()
	name = TextField()
	crossModelPaths = TextField(default="")
	tokensPath = TextField(default="")
	labelsPath = TextField(default="")
	store = JSONField(default={})

	class Meta:
		database = db

def init():
	db.connect()
	db.create_tables([Project, Ranking])
	return db

def deinit():
	if db:
		db.close()