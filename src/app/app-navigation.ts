export const navigation = [
  {
    text: 'Home',
    path: '/home',
    icon: 'home'
  },
  {
    text: 'Main Menu',
    icon: 'folder',
    items: [
      {
        text: 'Create Document',
        path: '/createDoc'
      },
      {
        text: 'Review', 
        path: '/viewPending' 
      },
      {
        text: 'Approval Document',
        path: '/approvalDoc'
      },
      {
        text: 'History ',
        path: '/tasks'
      },

    ]
  }
];
