import React from 'react'
import ManageCustomers from '../ManageCustomers/ManageCustomers'
import ManageAdmins from '../ManageAdmins/ManageAdmins'

function ManageUsers() {
  return (
    <div>
      <ManageCustomers />
      <ManageAdmins />
    </div>
  );
}

export default ManageUsers
