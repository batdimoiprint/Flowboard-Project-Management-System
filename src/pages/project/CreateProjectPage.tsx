import { useState } from 'react';
import { Button, Input, Label, Text, Avatar, Textarea, Card } from '@fluentui/react-components';
import { AddRegular } from '@fluentui/react-icons';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useCreateProjectStyles } from '../../components/styles/Styles';
import { projectsApi } from '../../components/apis/projects';
import { useUser } from '../../hooks/useUser';
import type { CreateProjectRequest } from '../../components/apis/projects';

export default function CreateProjectPage() {
    const styles = useCreateProjectStyles();
    const navigate = useNavigate();
    const { user } = useUser();
    const { register, handleSubmit, formState: { errors } } = useForm<CreateProjectRequest>();
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');

    const onSubmit = async (values: CreateProjectRequest) => {
        setFormError('');
        setLoading(true);

        try {
            // Use provided teamMembers if present; otherwise send an empty array
            const projectData = {
                ...values,
                teamMembers: values.teamMembers ?? [],
            };

            await projectsApi.createProject(projectData);
            // Redirect to projects list or home
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
        <Card className={styles.root}>
            <h1 className={styles.title}>Create Project</h1>
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.field}>
                    <Label htmlFor="projectName">Enter your project name</Label>
                    <Input
                        id="projectName"
                        type="text"
                        placeholder="Project Name"
                        {...register('projectName', { required: 'Project name is required' })}
                    />
                    {errors.projectName && (
                        <Text style={{ color: 'red' }}>{errors.projectName.message}</Text>
                    )}
                </div>
                <div className={styles.field}>
                    <Textarea
                        id="description"
                        placeholder="Project Description"
                        {...register('description')}
                        className={styles.textarea}
                    />
                </div>
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Project Manager</h2>
                    {user && (
                        <div className={styles.personaRow}>
                            <Avatar
                                name={`${user.firstName} ${user.lastName}`}
                                image={{ src: user.userIMG || undefined }}
                                size={40}
                            />
                            <div>
                                <Text weight="semibold">{`${user.firstName} ${user.lastName}`}</Text>
                                <Text>Project Manager</Text>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Members</h2>
                    <div className={styles.inviteRow}>
                        <AddRegular />
                        <Text>Invite Member</Text>
                    </div>
                </div>
                {formError && (
                    <Text style={{ color: 'red', marginTop: '8px' }}>
                        {formError}
                    </Text>
                )}
                <div className={styles.actions}>
                    <Button appearance="outline" onClick={() => navigate('/home')} type="button">
                        Cancel
                    </Button>
                    <Button appearance="primary" type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Project'}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
