"""
Copyright ©2020. The Regents of the University of California (Regents). All Rights Reserved.

Permission to use, copy, modify, and distribute this software and its documentation
for educational, research, and not-for-profit purposes, without fee and without a
signed licensing agreement, is hereby granted, provided that the above copyright
notice, this paragraph and the following two paragraphs appear in all copies,
modifications, and distributions.

Contact The Office of Technology Licensing, UC Berkeley, 2150 Shattuck Avenue,
Suite 510, Berkeley, CA 94720-1620, (510) 643-7201, otl@berkeley.edu,
http://ipira.berkeley.edu/industry-info for commercial licensing opportunities.

IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT, SPECIAL,
INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS, ARISING OUT OF
THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF REGENTS HAS BEEN ADVISED
OF THE POSSIBILITY OF SUCH DAMAGE.

REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. THE
SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED HEREUNDER IS PROVIDED
"AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES,
ENHANCEMENTS, OR MODIFICATIONS.
"""

from boac import db, std_commit
from boac.lib.util import utc_now
from boac.models.base import Base


class DropInAdvisor(Base):
    __tablename__ = 'drop_in_advisors'

    authorized_user_id = db.Column(db.Integer, db.ForeignKey('authorized_users.id'), nullable=False, primary_key=True)
    dept_code = db.Column(db.String(80), nullable=False, primary_key=True)
    is_available = db.Column(db.Boolean, default=False, nullable=False)
    deleted_at = db.Column(db.DateTime, nullable=True)
    is_supervisor_on_call = db.Column(db.Boolean, default=False, nullable=False)

    authorized_user = db.relationship('AuthorizedUser', back_populates='drop_in_departments')

    def __init__(self, authorized_user_id, dept_code, is_available, is_supervisor_on_call):
        self.authorized_user_id = authorized_user_id
        self.dept_code = dept_code
        self.is_available = is_available
        self.is_supervisor_on_call = is_supervisor_on_call

    def update_availability(self, available):
        self.is_available = available
        std_commit()

    @classmethod
    def create_or_update_status(cls, university_dept, authorized_user_id, is_available=False, is_supervisor_on_call=False):
        dept_code = university_dept.dept_code
        existing_status = cls.query.filter_by(dept_code=dept_code, authorized_user_id=authorized_user_id).first()
        if existing_status:
            status = existing_status
            status.deleted_at = None
            status.is_available = is_available
            status.is_supervisor_on_call = is_supervisor_on_call
        else:
            status = cls(
                authorized_user_id=authorized_user_id,
                dept_code=dept_code,
                is_available=is_available,
                is_supervisor_on_call=is_supervisor_on_call,
            )
        db.session.add(status)
        std_commit()
        return status

    @classmethod
    def advisors_for_dept_code(cls, dept_code):
        return cls.query.filter_by(dept_code=dept_code, deleted_at=None).all()

    @classmethod
    def get_all(cls, authorized_user_id):
        return cls.query.filter_by(authorized_user_id=authorized_user_id, deleted_at=None).all()

    @classmethod
    def delete(cls, authorized_user_id, dept_code):
        row = cls.query.filter_by(authorized_user_id=authorized_user_id, dept_code=dept_code, deleted_at=None).first()
        if not row:
            return False
        row.deleted_at = utc_now()
        std_commit()
        return True

    @classmethod
    def delete_orphans(cls):
        sql = """
            UPDATE drop_in_advisors AS a SET deleted_at = now()
                WHERE a.deleted_at IS NULL
                AND authorized_user_id NOT IN (
                    SELECT m.authorized_user_id
                    FROM university_depts AS d
                    JOIN university_dept_members AS m
                    ON m.university_dept_id = d.id
                    WHERE d.dept_code = a.dept_code
                );"""
        db.session.execute(sql)
        std_commit()

    def to_api_json(self):
        return {
            'deptCode': self.dept_code,
            'available': self.is_available,
            'supervisorOnCall': self.is_supervisor_on_call,
        }
