export const createOperatorInviteUrl = (user) => {
  const inviteUrl = new URL(window.location.pathname, window.location.origin);
  inviteUrl.searchParams.set('join', JSON.stringify({
    id: user.id,
    name: user.name,
    role: user.role,
    avatarId: user.avatarId,
    qrToken: user.qrToken || `JTF26-ATT-${user.id}`
  }));
  return inviteUrl.toString();
};
