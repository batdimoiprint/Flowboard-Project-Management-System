import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  tokens,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Dropdown,
  Option,
  Input,
  Textarea,
  mergeClasses,
} from '@fluentui/react-components';
import { AddCircle20Regular, FolderOpen24Regular, Edit20Regular, Checkmark20Regular, Dismiss20Regular } from '@fluentui/react-icons';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { projectsApi, type Project } from '../../components/apis/projects';
import { usersApi } from '../../components/apis/users';
import { mainLayoutStyles } from '../../components/styles/Styles';
import type { User } from '../../components/apis/auth';
import { useUser } from '../../hooks/useUser';

type MemberDetail = {
  id: string;
  displayName: string;
  email: string;
  joinedAt?: string;
  role: string;
};

// Permission label types are no longer used in the UI, but kept for reference if needed

const toSlug = (value: string) => value.toLowerCase().replace(/\s+/g, '-');

const resolveDisplayName = (user: User | null, fallbackId: string) => {
  if (!user) {
    return `Member ${fallbackId.slice(-4)}`;
  }
  const combined = `${user.firstName} ${user.lastName}`.trim();
  if (combined) {
    return combined;
  }
  if (user.userName) {
    return user.userName;
  }
  return `Member ${fallbackId.slice(-4)}`;
};

// Permissions are no longer shown in the members table

const formatDate = (iso?: string) => {
  if (!iso) {
    return '—';
  }
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });
};

// Visual badges removed - not displayed in the members table

function ProjectGlyph() {
  return (
    <div
      style={{
        width: 90,
        height: 90,
        borderRadius: tokens.borderRadiusXLarge,
        backgroundColor: tokens.colorBrandBackground2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <FolderOpen24Regular style={{ fontSize: 48, color: tokens.colorBrandForeground1 }} />
    </div>
  );
}

export default function ProjectPage() {
  const styles = mainLayoutStyles();
  const { projectName } = useParams<{ projectName: string }>();
  const decodedParam = projectName ? decodeURIComponent(projectName) : '';
  const normalizedSlug = decodedParam ? toSlug(decodedParam) : '';
  const navigate = useNavigate();
  const { user: currentUser } = useUser();
  const outlet = useOutletContext<{ bumpProjects?: () => void } | undefined>();

  const [project, setProject] = useState<Project | null>(null);
  const [manager, setManager] = useState<User | null>(null);
  const [members, setMembers] = useState<MemberDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  const refreshProject = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      if (!normalizedSlug) {
        setError('Missing project identifier');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const allProjects = await projectsApi.getAllProjects();
        if (!active) {
          return;
        }
        const matched = allProjects.find((proj) => toSlug(proj.projectName) === normalizedSlug);

        if (!matched) {
          if (active) {
            setError('Project not found');
            setProject(null);
            setMembers([]);
            setManager(null);
          }
          return;
        }

        if (!active) {
          return;
        }

        setProject(matched);

        const userCache = new Map<string, User | null>();
        const fetchUser = async (userId?: string | null) => {
          if (!userId) {
            return null;
          }
          if (userCache.has(userId)) {
            return userCache.get(userId) ?? null;
          }
          try {
            const user = await usersApi.getUserById(userId);
            userCache.set(userId, user);
            return user;
          } catch {
            userCache.set(userId, null);
            return null;
          }
        };

        const managerUser = await fetchUser(matched.createdBy);
        if (!active) {
          return;
        }
        setManager(managerUser);

        // Exclude the project owner (createdBy) from the members list
        const uniqueMemberIds = Array.from(new Set((matched.teamMembers ?? []).filter((id) => id !== matched.createdBy)));
        if (!uniqueMemberIds.length) {
          setMembers([]);
        } else {
          const memberPayload = await Promise.all(
            uniqueMemberIds.map(async (memberId) => ({ id: memberId, user: await fetchUser(memberId) }))
          );
          if (!active) {
            return;
          }
          setMembers(
            memberPayload.map(({ id, user }) => ({
              id,
              displayName: resolveDisplayName(user, id),
              email: user?.email ?? 'Unavailable',
              joinedAt: user?.createdAt ?? matched.createdAt,
              role: matched.permissions?.[id] ?? 'Member',
            }))
          );
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load project information');
          setProject(null);
          setMembers([]);
          setManager(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      active = false;
    };
  }, [normalizedSlug, refreshTrigger]);

  const heading = useMemo(() => {
    if (project?.projectName) {
      return project.projectName;
    }
    if (decodedParam) {
      return decodedParam.replace(/-/g, ' ');
    }
    return 'Project';
  }, [decodedParam, project?.projectName]);

  const subtitle = project?.description || 'For the IPT Project';

  const isOwner = useMemo(() => {
    if (!currentUser || !project) return false;
    // Owner can be the creator OR a user explicitly set with Owner role in permissions
    const role = project.permissions?.[currentUser.id];
    return project.createdBy === currentUser.id || role === 'Owner';
  }, [currentUser, project]);

  const handleInviteMember = async () => {
    if (!selectedUserId || !project?.id) return;
    setActionLoading(true);
    try {
      await projectsApi.addProjectMembers(project.id, [selectedUserId]);
      setInviteDialogOpen(false);
      setSelectedUserId('');
      refreshProject();
    } catch (err) {
      console.error('Failed to invite member:', err);
      alert('Failed to invite member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!project?.id) return;
    if (!confirm('Remove this member from the project?')) return;
    setActionLoading(true);
    try {
      await projectsApi.removeProjectMembers(project.id, memberId);
      refreshProject();
    } catch (err) {
      console.error('Failed to remove member:', err);
      alert('Failed to remove member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!project?.id) return;
    setActionLoading(true);
    try {
      await projectsApi.deleteProject(project.id);
      setDeleteDialogOpen(false);
      // Notify parent (Sidebar / ProjectList) to refresh
      outlet?.bumpProjects?.();
      navigate('/home/project');
    } catch (err) {
      console.error('Failed to delete project:', err);
      alert('Failed to delete project');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveProject = async () => {
    if (!project?.id) return;
    if (!confirm('Are you sure you want to leave this project?')) return;
    setActionLoading(true);
    try {
      await projectsApi.leaveProject(project.id);
      // notify parent sidebar/list to refresh
      outlet?.bumpProjects?.();
      navigate('/home/project');
    } catch (err) {
      console.error('Failed to leave project:', err);
      alert('Failed to leave project');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartEdit = () => {
    setEditedName(project?.projectName || '');
    setEditedDescription(project?.description || '');
    setIsEditingProject(true);
  };

  const handleCancelEdit = () => {
    setIsEditingProject(false);
    setEditedName('');
    setEditedDescription('');
  };

  const handleSaveProject = async () => {
    if (!project?.id || !editedName.trim()) return;
    setActionLoading(true);
    try {
      await projectsApi.updateProject(project.id, {
        projectName: editedName.trim(),
        description: editedDescription.trim(),
        teamMembers: project.teamMembers,
      });
      setIsEditingProject(false);
      refreshProject();
      outlet?.bumpProjects?.();
    } catch (err) {
      console.error('Failed to update project:', err);
      alert('Failed to update project');
    } finally {
      setActionLoading(false);
    }
  };

  const openInviteDialog = async () => {
    try {
      const users = await usersApi.getAllUsers();
      // Filter out current members and manager
      const memberIds = new Set([...(project?.teamMembers ?? []), project?.createdBy]);
      const availableUsers = users.filter((u) => !memberIds.has(u.id));
      setAllUsers(availableUsers);
      setInviteDialogOpen(true);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      alert('Failed to load users');
    }
  };

  // Permissions badges removed - no longer rendered in table

  return (
    <Card
      className={mergeClasses(styles.artifCard, styles.layoutPadding, styles.wFull, styles.hFull, styles.componentBorder)}
      style={{ minHeight: 'calc(100vh - 160px)' }}
    >
      {loading && (
        <div className={styles.alignCenter} style={{ padding: tokens.spacingVerticalXXXL }}>
          <Spinner label="Loading project details" />
        </div>
      )}

      {!loading && error && (
        <div className={styles.errorText}>{error}</div>
      )}

      {!loading && !error && (
        <>
          <div className={mergeClasses(styles.spaceBetweenRow, styles.wFull)} style={{ gap: tokens.spacingHorizontalXXL, flexWrap: 'wrap' }}>
            <div className={styles.personaRow} style={{ flex: 1, gap: tokens.spacingHorizontalL }}>
              <ProjectGlyph />
              <div style={{ flex: 1 }}>
                {isEditingProject ? (
                  <>
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      placeholder="Project name"
                      size="large"
                      style={{ marginBottom: tokens.spacingVerticalS, fontSize: tokens.fontSizeHero700, fontWeight: 600 }}
                    />
                    <Textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      placeholder="Project description"
                      resize="vertical"
                      style={{ marginBottom: tokens.spacingVerticalS }}
                    />
                  </>
                ) : (
                  <>
                    <h1 className={styles.pageTitle}>
                      {heading}
                    </h1>
                    <p
                      style={{
                        marginTop: tokens.spacingVerticalXXS,
                        marginBottom: 0,
                        color: tokens.colorNeutralForeground3,
                        fontSize: tokens.fontSizeBase300,
                      }}
                    >
                      {subtitle}
                    </p>
                  </>
                )}
                {manager && (
                  <div style={{ marginTop: tokens.spacingVerticalS }}>
                    <div className={styles.personaRow} style={{ gap: tokens.spacingHorizontalS }}>
                      <Avatar size={24} name={(manager.firstName ?? '') + ' ' + (manager.lastName ?? '')} image={{ src: manager.userIMG || undefined }} />
                      <div style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>Project Manager • {manager.userName ?? resolveDisplayName(manager, project?.createdBy ?? '')}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.personaRow} style={{ gap: tokens.spacingHorizontalS }}>
              {isOwner && (
                isEditingProject ? (
                  <>
                    <Button appearance="primary" size="large" icon={<Checkmark20Regular />} onClick={handleSaveProject} disabled={actionLoading || !editedName.trim()}>
                      {actionLoading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button appearance="secondary" size="large" icon={<Dismiss20Regular />} onClick={handleCancelEdit} disabled={actionLoading}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button appearance="secondary" size="large" icon={<Edit20Regular />} onClick={handleStartEdit}>
                      Edit Project
                    </Button>
                    <Button appearance="primary" size="large" onClick={() => setDeleteDialogOpen(true)}>
                      Delete Project
                    </Button>
                  </>
                )
              )}
              {!isOwner && (
                <Button appearance="primary" size="large" onClick={handleLeaveProject} disabled={actionLoading}>
                  {actionLoading ? 'Leaving...' : 'Leave Team'}
                </Button>
              )}
            </div>
          </div>


          <section className={styles.section}>
            <span className={styles.sectionTitle}>Members</span>
            {members.length === 0 ? (
              <div style={{ color: tokens.colorNeutralForeground3 }}>No team members have been added yet.</div>
            ) : (
              <Table aria-label="Project members" className={styles.wFull}>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Member Name</TableHeaderCell>
                    <TableHeaderCell>Joined At</TableHeaderCell>
                    <TableHeaderCell>Email</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className={styles.personaRow}>
                          <Avatar size={32} name={member.displayName} color="colorful" />
                          <div>
                            <div style={{ fontWeight: 600 }}>{member.displayName}</div>
                            <div style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>{member.role}</div>
                          </div>
                        </div>
                      </TableCell>
                      {/* Permission access not shown */}
                      <TableCell>
                        <div className={styles.personaRow} style={{ gap: tokens.spacingHorizontalXXS }}>

                          <span>{formatDate(member.joinedAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        {isOwner && (
                          <Button
                            appearance="secondary"
                            size="small"
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={actionLoading}
                          >
                            Remove Member
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {isOwner && (
              <div>
                <Button appearance="secondary" icon={<AddCircle20Regular />} onClick={openInviteDialog}>
                  Invite Member
                </Button>
              </div>
            )}
          </section>
        </>
      )}

      {/* Invite Member Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={(_, data) => setInviteDialogOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Invite Member to Project</DialogTitle>
            <DialogContent>
              <Dropdown
                placeholder="Select a user"
                value={allUsers.find((u) => u.id === selectedUserId)?.userName || ''}
                onOptionSelect={(_, data) => setSelectedUserId(data.optionValue || '')}
              >
                {allUsers.map((user) => (
                  <Option key={user.id} value={user.id} text={`${user.userName} (${user.email})`}>
                    {user.userName} ({user.email})
                  </Option>
                ))}
              </Dropdown>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button appearance="primary" onClick={handleInviteMember} disabled={!selectedUserId || actionLoading}>
                {actionLoading ? 'Inviting...' : 'Invite'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={(_, data) => setDeleteDialogOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogContent>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button appearance="primary" onClick={handleDeleteProject} disabled={actionLoading}>
                {actionLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </Card>
  );
}
