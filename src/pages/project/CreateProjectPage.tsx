import { useState } from 'react';
import { Button, Input, Label, Text, Avatar, Textarea, Card } from '@fluentui/react-components';
import { AddRegular } from '@fluentui/react-icons';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { mainLayoutStyles } from '../../components/styles/Styles';
import { mergeClasses } from '@fluentui/react-components';
import { projectsApi } from '../../components/apis/projects';
import { useUser } from '../../hooks/useUser';
import type { CreateProjectRequest } from '../../components/apis/projects';

export default function CreateProjectPage() {
    const s = mainLayoutStyles();
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
        <Card className={mergeClasses(s.flexColFill, s.layoutPadding)}>
            {/* Title and Actions Row - aligned like MyProfile */}
            <div className={mergeClasses(s.flexRowFill, s.spaceBetween)}>
                <div className={mergeClasses(s.flexRowFit, s.alignCenter)}>
                    <h1 className={mergeClasses(s.brand)}>Create Project</h1>
                </div>
                <div className={mergeClasses(s.flexColFit, s.alignCenter)}>
                    <Button appearance="outline" onClick={() => navigate('/home')} type="button">
                        Cancel
                    </Button>
                    <Button appearance="primary" type="submit" disabled={loading} style={{ marginTop: '8px' }}>
                        {loading ? 'Creating...' : 'Create Project'}
                    </Button>
                </div>
            </div>

            <form className={mergeClasses(s.formSection)} onSubmit={handleSubmit(onSubmit)}>
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
                    <div className={mergeClasses(s.personaRow)}>
                        <AddRegular />
                        <Text>Invite Member</Text>
                    </div>
                </div>
                {formError && (
                    <Text style={{ color: 'red', marginTop: '8px' }}>
                        {formError}
                    </Text>
                )}

            </form>
        </Card>
    );
}
