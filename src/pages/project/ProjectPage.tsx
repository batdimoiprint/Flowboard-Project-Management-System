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
} from '@fluentui/react-components';
import { AddCircle20Regular, ChevronDown12Regular, Edit16Regular } from '@fluentui/react-icons';
import { useParams } from 'react-router-dom';
import { projectsApi, type Project } from '../../components/apis/projects';
import { usersApi } from '../../components/apis/users';
import type { User } from '../../components/apis/auth';

type MemberDetail = {
  id: string;
  displayName: string;
  email: string;
  joinedAt?: string;
  role: string;
};

type PermissionLabel = 'Create' | 'Update' | 'Delete';

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

const getPermissionLabels = (role: string): PermissionLabel[] => {
  const normalized = role?.toLowerCase();
  if (normalized === 'owner') {
    return ['Create', 'Update', 'Delete'];
  }
  if (normalized === 'editor') {
    return ['Update', 'Delete'];
  }
  if (normalized === 'member') {
    return ['Update'];
  }
  return ['Update'];
};

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

const permissionVisuals: Record<PermissionLabel, { background: string; color: string; border: string }> = {
  Create: {
    background: tokens.colorPaletteRedBackground1,
    color: tokens.colorPaletteRedForeground1,
    border: tokens.colorPaletteRedBorderActive,
  },
  Update: {
    background: tokens.colorPaletteGreenBackground1,
    color: tokens.colorPaletteGreenForeground1,
    border: tokens.colorPaletteGreenBorderActive,
  },
  Delete: {
    background: tokens.colorPaletteRedBackground2,
    color: tokens.colorPaletteRedForeground2,
    border: tokens.colorPaletteRedBorderActive,
  },
};

function ProjectGlyph() {
  const tileStyle = {
    width: 18,
    height: 18,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: '#174580',
  } as const;

  return (
    <div
      style={{
        width: 90,
        height: 90,
        borderRadius: tokens.borderRadiusXLarge,
        backgroundColor: '#E5EEFF',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 10,
        padding: 10,
        boxSizing: 'border-box',
      }}
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} style={tileStyle} />
      ))}
    </div>
  );
}

export default function ProjectPage() {
  const { projectName } = useParams<{ projectName: string }>();
  const decodedParam = projectName ? decodeURIComponent(projectName) : '';
  const normalizedSlug = decodedParam ? toSlug(decodedParam) : '';

  const [project, setProject] = useState<Project | null>(null);
  const [manager, setManager] = useState<User | null>(null);
  const [members, setMembers] = useState<MemberDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

        const uniqueMemberIds = Array.from(new Set(matched.teamMembers ?? []));
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
              role: matched.permissions?.[id] ?? (id === matched.createdBy ? 'Owner' : 'Member'),
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
  }, [normalizedSlug]);

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

  const renderPermissionBadges = (labels: PermissionLabel[]) => (
    <div style={{ display: 'flex', gap: tokens.spacingHorizontalXS, flexWrap: 'wrap' }}>
      {labels.map((label) => (
        <span
          key={label}
          style={{
            padding: '2px 8px',
            borderRadius: tokens.borderRadiusMedium,
            fontSize: tokens.fontSizeBase100,
            fontWeight: 600,
            border: `1px solid ${permissionVisuals[label].border}`,
            backgroundColor: permissionVisuals[label].background,
            color: permissionVisuals[label].color,
          }}
        >
          {label}
        </span>
      ))}
    </div>
  );

  return (
    <Card
      style={{
        padding: tokens.spacingVerticalXXXL,
        width: '100%',
        boxSizing: 'border-box',
        borderRadius: tokens.borderRadiusXLarge,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalXL,
        minHeight: 'calc(100vh - 160px)',
      }}
    >
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacingVerticalXXXL }}>
          <Spinner label="Loading project details" />
        </div>
      )}

      {!loading && error && (
        <div style={{ color: tokens.colorPaletteRedForeground1 }}>{error}</div>
      )}

      {!loading && !error && (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: tokens.spacingHorizontalXXL,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', gap: tokens.spacingHorizontalL, alignItems: 'center', flex: 1 }}>
              <ProjectGlyph />
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: tokens.fontSizeHero700,
                    lineHeight: '40px',
                    fontWeight: 600,
                  }}
                >
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
              </div>
            </div>
            <div style={{ display: 'flex', gap: tokens.spacingHorizontalS }}>
              <Button appearance="secondary" size="large">
                Edit Team
              </Button>
              <Button appearance="primary" size="large">
                Leave Team
              </Button>
            </div>
          </div>

          <section style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalXXS }}>
              <span style={{ fontWeight: 600, fontSize: tokens.fontSizeBase300 }}>Project Manager</span>
              <Button icon={<Edit16Regular />} appearance="subtle" size="small" aria-label="Edit project manager" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalM }}>
              <Avatar
                size={64}
                name={manager ? `${manager.firstName} ${manager.lastName}` : heading}
                color="colorful"
              />
              <div>
                <div style={{ fontSize: tokens.fontSizeBase500, fontWeight: 600 }}>{
                  manager ? `${manager.firstName} ${manager.lastName}`.trim() || manager.userName : heading
                }</div>
                <div style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>
                  {manager?.email || ''}
                </div>
              </div>
            </div>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS }}>
            <span style={{ fontWeight: 600, fontSize: tokens.fontSizeBase300 }}>Members</span>
            {members.length === 0 ? (
              <div style={{ color: tokens.colorNeutralForeground3 }}>No team members have been added yet.</div>
            ) : (
              <Table aria-label="Project members" style={{ width: '100%' }}>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Member Name</TableHeaderCell>
                    <TableHeaderCell>Permission Access</TableHeaderCell>
                    <TableHeaderCell>Joined At</TableHeaderCell>
                    <TableHeaderCell>Email</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
                          <Avatar size={32} name={member.displayName} color="colorful" />
                          <div>
                            <div style={{ fontWeight: 600 }}>{member.displayName}</div>
                            <div style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>{member.role}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {renderPermissionBadges(getPermissionLabels(member.role))}
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalXXS }}>
                          <ChevronDown12Regular />
                          <span>{formatDate(member.joinedAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Button appearance="secondary" size="small">
                          Remove Member
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div>
              <Button appearance="secondary" icon={<AddCircle20Regular />}>
                Invite Member
              </Button>
            </div>
          </section>
        </>
      )}
    </Card>
  );
}
