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
import { AddCircle20Regular, ChevronDown12Regular } from '@fluentui/react-icons';
import { useParams } from 'react-router-dom';
import { projectsApi, type Project } from '../../components/apis/projects';
import { usersApi } from '../../components/apis/users';
import { mainLayoutStyles } from '../../components/styles/Styles';
import type { User } from '../../components/apis/auth';

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
  const styles = mainLayoutStyles();
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

  // Permissions badges removed - no longer rendered in table

  return (
    <Card
      className={`${styles.artifCard} ${styles.layoutPadding} ${styles.wFull}`}
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
          <div className={`${styles.spaceBetweenRow} ${styles.wFull}`} style={{ gap: tokens.spacingHorizontalXXL, flexWrap: 'wrap' }}>
            <div className={`${styles.personaRow}`} style={{ flex: 1, gap: tokens.spacingHorizontalL }}>
              <ProjectGlyph />
              <div>
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
              <Button appearance="secondary" size="large">
                Edit Team
              </Button>
              <Button appearance="primary" size="large">
                Leave Team
              </Button>
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
