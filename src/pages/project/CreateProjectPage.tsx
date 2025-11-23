import { useState, useEffect, useMemo } from 'react';
import {
    Button,
    Input,
    Label,
    Text,
    Avatar,
    Textarea,
    Card,
    Dropdown,
    Option,
    AvatarGroup,
    AvatarGroupItem,
    AvatarGroupPopover,
} from '@fluentui/react-components';
import { AddRegular } from '@fluentui/react-icons';
import { useForm } from 'react-hook-form';
import { useNavigate, useOutletContext } from 'react-router';
import { mainLayoutStyles } from '../../components/styles/Styles';
import { mergeClasses } from '@fluentui/react-components';
import { projectsApi } from '../../components/apis/projects';
import { useUser } from '../../hooks/useUser';
import type { CreateProjectRequest } from '../../components/apis/projects';
import { usersApi } from '../../components/apis/users';
import type { User } from '../../components/apis/auth';
import type { DropdownProps } from '@fluentui/react-components';

export default function CreateProjectPage() {
    const s = mainLayoutStyles();
    const navigate = useNavigate();
    const { user } = useUser();
    type CreateProjectForm = Pick<CreateProjectRequest, 'projectName' | 'description'>;
    const { register, handleSubmit, formState: { errors } } = useForm<CreateProjectForm>();
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [membersLoading, setMembersLoading] = useState(true);
    const [membersError, setMembersError] = useState('');

    useEffect(() => {
        let isMounted = true;
        const loadUsers = async () => {
            try {
                setMembersError('');
                setMembersLoading(true);
                const users = await usersApi.getAllUsers();
                if (!isMounted) return;
                setAvailableUsers(users);
            } catch (error) {
                console.error('Failed to fetch users', error);
                if (isMounted) setMembersError('Unable to load team members.');
            } finally {
                if (isMounted) setMembersLoading(false);
            }
        };

        loadUsers();
        return () => {
            isMounted = false;
        };
    }, []);

    const currentUserId = user?.id ?? '';
    const selectableUsers = useMemo(() => (
        availableUsers.filter((candidate) => candidate.id !== currentUserId)
    ), [availableUsers, currentUserId]);

    const selectedMemberDetails = useMemo(() => (
        selectedMembers
            .map((memberId) => availableUsers.find((candidate) => candidate.id === memberId))
            .filter((member): member is User => Boolean(member))
    ), [selectedMembers, availableUsers]);

    const handleMemberSelect: DropdownProps['onOptionSelect'] = (_, data) => {
        const selected = data.selectedOptions;
        if (!selected) {
            setSelectedMembers([]);
            return;
        }
        if (selected instanceof Set) {
            setSelectedMembers(Array.from(selected.values()) as string[]);
        } else if (Array.isArray(selected)) {
            setSelectedMembers(selected as string[]);
        } else if (typeof selected === 'string') {
            setSelectedMembers([selected]);
        } else {
            setSelectedMembers([]);
        }
    };

    const outlet = useOutletContext<{ bumpProjects?: () => void } | undefined>();

    const onSubmit = async (values: CreateProjectForm) => {
        setFormError('');
        setLoading(true);

        try {
            const projectData: CreateProjectRequest = {
                projectName: values.projectName,
                description: values.description,
            };

            const createdProject = await projectsApi.createProject(projectData);

            if (selectedMembers.length > 0) {
                try {
                    await projectsApi.addProjectMembers(createdProject.id, selectedMembers);
                } catch (memberError) {
                    console.error('Failed to add members to project', memberError);
                    window.alert('Project created but failed to add selected members. You can add them later from the project page.');
                }
            }

            // Signal refresh for other components and redirect
            outlet?.bumpProjects?.();
            navigate('/home/project/');
        } catch (error: unknown) {
            if (error instanceof Error) {
                setFormError(error.message);
            } else {
                setFormError('An error occurred during project creation');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={mergeClasses(s.flexColFill, s.layoutPadding)}>
            {/* Title and Actions Row - flex row space-between */}
            <div className={mergeClasses(s.flexRowFit, s.wFull, s.spaceBetween)}>
                <h1 className={mergeClasses(s.brand, s.pageTitle)}>Create Project</h1>
                <div className={mergeClasses(s.flexRowFit, s.gap)}>
                    <Button appearance="outline" onClick={() => navigate('/home')} type='button'>
                        Cancel
                    </Button>
                    <Button appearance="primary" type="button" onClick={handleSubmit(onSubmit)} disabled={loading}>
                        {loading ? 'Creating...' : 'Create Project'}
                    </Button>
                </div>
            </div>

            <form className={mergeClasses(s.formSection)} onSubmit={handleSubmit(onSubmit)}>
                {/* Invisible submit button to support Enter key submits while visible create button sits outside of form */}
                <button type="submit" style={{ display: 'none' }} aria-hidden />
                <div className={mergeClasses(s.formField)}>
                    <Label htmlFor="projectName">Enter your project name</Label>
                    <Input
                        id="projectName"
                        type="text"
                        placeholder="Project Name"
                        {...register('projectName', { required: 'Project name is required' })}
                        className={mergeClasses(s.fullWidth)}
                    />
                    {errors.projectName && (
                        <Text className={mergeClasses(s.errorText)}>{errors.projectName.message}</Text>
                    )}
                </div>
                <div className={mergeClasses(s.formField)}>
                    <Textarea
                        id="description"
                        placeholder="Project Description"
                        {...register('description')}
                        className={mergeClasses(s.fullWidth, s.textareaMinHeight)}
                    />
                </div>
                <div className={mergeClasses(s.section)}>
                    <h2 className={mergeClasses(s.sectionTitle)}>Project Manager</h2>
                    {user && (
                        <div className={mergeClasses(s.personaRow)}>
                            <Avatar
                                name={`${user.firstName} ${user.lastName}`}
                                image={{ src: user.userIMG || undefined }}
                                size={40}
                            />
                            <div>
                                <Text weight="semibold">{`${user.firstName} ${user.lastName}`}</Text>

                            </div>
                        </div>
                    )}
                </div>

                <div className={mergeClasses(s.section)}>
                    <h2 className={mergeClasses(s.sectionTitle)}>Members</h2>
                    {selectedMemberDetails.length > 0 ? (
                        <AvatarGroup layout="stack">
                            {selectedMemberDetails.slice(0, 4).map((member) => (
                                <AvatarGroupItem
                                    key={member.id}
                                    name={`${member.firstName} ${member.lastName}`}
                                    avatar={{ image: member.userIMG ? { src: member.userIMG } : undefined }}
                                />
                            ))}
                            {selectedMemberDetails.length > 4 && (
                                <AvatarGroupPopover>
                                    {selectedMemberDetails.slice(4).map((member) => (
                                        <AvatarGroupItem
                                            key={`overflow-${member.id}`}
                                            name={`${member.firstName} ${member.lastName}`}
                                            avatar={{ image: member.userIMG ? { src: member.userIMG } : undefined }}
                                        />
                                    ))}
                                </AvatarGroupPopover>
                            )}
                        </AvatarGroup>
                    ) : (
                        <div className={mergeClasses(s.flexRowFit, s.gap)}>
                            <AddRegular />
                            <Text>Select members to collaborate on this project.</Text>
                        </div>
                    )}

                    <Label htmlFor="memberDropdown">Invite Members</Label>
                    <Dropdown
                        id="memberDropdown"
                        multiselect
                        placeholder={membersLoading ? 'Loading users...' : 'Select team members'}
                        selectedOptions={selectedMembers}
                        onOptionSelect={handleMemberSelect}
                        disabled={membersLoading || !!membersError || selectableUsers.length === 0}
                        className={mergeClasses(s.fullWidth)}
                    >
                        {selectableUsers.map((member) => (
                            <Option key={member.id} value={member.id} text={member.userName}>
                                {`${member.firstName} ${member.lastName}`} {member.email ? `(${member.email})` : ''}
                            </Option>
                        ))}
                    </Dropdown>
                    {membersError && (
                        <Text className={mergeClasses(s.errorText)}>{membersError}</Text>
                    )}
                </div>
                {formError && (
                    <Text style={{ color: 'red', marginTop: '8px' }}>
                        {formError}
                    </Text>
                )}

            </form>
        </Card >
    );
}
