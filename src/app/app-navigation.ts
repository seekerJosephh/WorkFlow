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
        text: 'View Pending Docs', 
        path: '/viewPending' 
      },
      {
        text: 'Review / Approval',
        path: '/tasks'
      },

    ]
  }
];
