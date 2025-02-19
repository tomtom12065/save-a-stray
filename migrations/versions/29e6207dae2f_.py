"""empty message

Revision ID: 29e6207dae2f
Revises: 
Create Date: 2025-02-04 21:58:03.508242

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '29e6207dae2f'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.String(length=120), nullable=False),
    sa.Column('password', sa.String(length=240), nullable=False),
    sa.Column('salt', sa.String(length=120), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('username', sa.String(length=250), nullable=False),
    sa.Column('profilepic', sa.String(length=250), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('cats',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=50), nullable=False),
    sa.Column('breed', sa.String(length=50), nullable=False),
    sa.Column('age', sa.Integer(), nullable=False),
    sa.Column('price', sa.Float(), nullable=False),
    sa.Column('image_urls', sa.Text(), nullable=True),
    sa.Column('description', sa.String(length=1000), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('chat_messages',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('sender_id', sa.Integer(), nullable=False),
    sa.Column('recipient_id', sa.Integer(), nullable=False),
    sa.Column('read', sa.Boolean(), nullable=True),
    sa.Column('text', sa.String(), nullable=False),
    sa.Column('timestamp', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['recipient_id'], ['users.id'], ),
    sa.ForeignKeyConstraint(['sender_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('applications',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('cat_id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('applicant_name', sa.String(length=120), nullable=False),
    sa.Column('contact_info', sa.String(length=255), nullable=False),
    sa.Column('reason', sa.Text(), nullable=False),
    sa.Column('status', sa.String(length=50), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['cat_id'], ['cats.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('applications')
    op.drop_table('chat_messages')
    op.drop_table('cats')
    op.drop_table('users')
    # ### end Alembic commands ###
