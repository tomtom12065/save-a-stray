"""empty message

Revision ID: 68d0f4f54d35
Revises: 308451c4328d
Create Date: 2024-11-02 20:59:23.643918

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '68d0f4f54d35'
down_revision = '308451c4328d'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_constraint('users_email_key', type_='unique')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.create_unique_constraint('users_email_key', ['email'])

    # ### end Alembic commands ###
