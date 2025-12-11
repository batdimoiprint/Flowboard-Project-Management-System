import { Button } from '@fluentui/react-components';
import { DocumentPdfRegular } from '@fluentui/react-icons';
import jsPDF from 'jspdf';
import flowboardLogoRaw from '../../assets/flowboard.svg?raw';
import type { ProjectStats } from '../apis/analytics';
import type { ProjectMember } from '../apis/projects';

interface ProjectReportGeneratorProps {
    projectStats: ProjectStats;
    projectMembers?: ProjectMember[];
    projectOwnerId?: string;
    appearance?: 'primary' | 'secondary' | 'outline';
}

const formatMemberName = (member: ProjectMember) => {
    const pieces = [member.firstName, member.middleName, member.lastName].filter(Boolean);
    return pieces.join(' ');
};

const encodeSvgToDataUrl = (svg: string) => `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;

const captureLogoPng = async (): Promise<string | null> => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return null;
    }

    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ratio = img.width && img.height ? img.height / img.width : 1;
            const width = 90;
            canvas.width = width;
            canvas.height = width * ratio;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(null);
                return;
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(null);
        img.src = encodeSvgToDataUrl(flowboardLogoRaw);
    });
};

export default function ProjectReportGenerator({
    projectStats,
    projectMembers = [],
    projectOwnerId,
    appearance = 'primary',
}: ProjectReportGeneratorProps) {
    const handleGenerate = async () => {
        const doc = new jsPDF('portrait', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        let yPos = margin;

        // Compact header bar
        doc.setFillColor(3, 66, 128);
        doc.rect(0, 0, pageWidth, 28, 'F');

        const logoData = await captureLogoPng();
        if (logoData) {
            doc.addImage(logoData, 'PNG', margin, 4, 20, 20);
        }

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('FLOWBOARD', margin + 25, 12);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Project Analytics Report', margin + 25, 18);

        yPos = 35;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(projectStats.projectName, margin, yPos);
        yPos += 6;

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(
            `Generated: ${new Date().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })}`,
            margin,
            yPos
        );
        yPos += 8;

        const owner =
            projectMembers.find(
                (member) =>
                    member.role?.toLowerCase() === 'owner' ||
                    member.role?.toLowerCase() === 'project manager' ||
                    member.role?.toLowerCase() === 'manager'
            ) || projectMembers.find((member) => member.id === projectOwnerId);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Owner:', margin, yPos);
        doc.setFont('helvetica', 'normal');
        const ownerName = owner ? formatMemberName(owner) : '—';
        doc.text(ownerName, margin + 18, yPos);

        doc.setFont('helvetica', 'bold');
        doc.text('Members:', margin + 80, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(`${projectMembers.length}`, margin + 100, yPos);
        yPos += 7;

        const statsHighlight = [
            { label: 'Team Members', value: projectStats.memberCount.toString() },
            { label: 'Main Tasks', value: projectStats.mainTaskCount.toString() },
            { label: 'Total Tasks', value: projectStats.subTaskCount.toString() },
            { label: 'Completion Rate', value: `${Math.round(projectStats.completionRate * 100)}%` },
        ];

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Project Overview', margin, yPos);
        yPos += 5;
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 6;

        doc.setFont('helvetica', 'normal');
        const colWidth = (pageWidth - 2 * margin) / 2;
        statsHighlight.forEach((stat, index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            const valueY = yPos + row * 12;
            const xPos = margin + col * colWidth;
            doc.setFontSize(7);
            doc.setTextColor(120, 120, 120);
            doc.text(stat.label, xPos, valueY);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(3, 66, 128);
            doc.text(stat.value, xPos, valueY + 5);
            doc.setTextColor(0, 0, 0);
        });
        yPos += 28;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Task Status Snapshot', margin, yPos);
        yPos += 5;
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 5;

        const statusBuckets = [
            { label: 'Completed', value: projectStats.completedSubTasks, color: [76, 175, 80] },
            { label: 'Remaining', value: projectStats.subTaskCount - projectStats.completedSubTasks, color: [255, 152, 0] },
            { label: 'Overdue', value: projectStats.overdueSubTasks, color: [244, 67, 54] },
        ];

        statusBuckets.forEach((bucket) => {
            const colorTuple: [number, number, number] = [bucket.color[0], bucket.color[1], bucket.color[2]];
            doc.setFillColor(...colorTuple);
            doc.circle(margin + 3, yPos - 1, 1.5, 'F');
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text(bucket.label, margin + 7, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(`${bucket.value}`, pageWidth - margin - 15, yPos);
            yPos += 5;
        });
        yPos += 4;

        if (Object.keys(projectStats.tasksByStatus).length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text('Task Distribution by Status', margin, yPos);
            yPos += 5;
            doc.setDrawColor(220, 220, 220);
            doc.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 5;

            let total = 0;
            Object.values(projectStats.tasksByStatus).forEach((value) => (total += value));
            const maxBarWidth = 60;

            Object.entries(projectStats.tasksByStatus).forEach(([status, count]) => {
                const currentY = yPos;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.text(status, margin + 4, currentY);
                doc.setFont('helvetica', 'bold');
                doc.text(count.toString(), pageWidth - margin - 12, currentY);

                const ratio = total === 0 ? 0 : count / total;
                doc.setFillColor(230, 230, 230);
                doc.rect(pageWidth - margin - 70, currentY - 3, maxBarWidth, 3, 'F');
                doc.setFillColor(3, 66, 128);
                doc.rect(pageWidth - margin - 70, currentY - 3, maxBarWidth * ratio, 3, 'F');
                yPos += 6;
            });
            yPos += 3;
        }

        if (projectStats.tasksByPriority && Object.keys(projectStats.tasksByPriority).length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text('Task Distribution by Priority', margin, yPos);
            yPos += 5;
            doc.setDrawColor(220, 220, 220);
            doc.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 5;

            const halfWidth = (pageWidth - 2 * margin) / 2;
            let col = 0;
            let rowY = yPos;

            Object.entries(projectStats.tasksByPriority).forEach(([priority, count]) => {
                const xPos = margin + 4 + col * halfWidth;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.text(`${priority.charAt(0).toUpperCase() + priority.slice(1)}`, xPos, rowY);
                doc.setFont('helvetica', 'bold');
                doc.text(count.toString(), xPos + 40, rowY);

                col++;
                if (col >= 2) {
                    col = 0;
                    rowY += 5;
                }
            });
            yPos = rowY + (col > 0 ? 5 : 0) + 3;
        }

        if (projectStats.tasksByCategory.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text('Task Distribution by Category', margin, yPos);
            yPos += 5;
            doc.setDrawColor(220, 220, 220);
            doc.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 5;

            const halfWidth = (pageWidth - 2 * margin) / 2;
            let col = 0;
            let rowY = yPos;

            projectStats.tasksByCategory.slice(0, 10).forEach((cat) => {
                const xPos = margin + 4 + col * halfWidth;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                const catName = cat.categoryName.length > 20 ? cat.categoryName.substring(0, 18) + '...' : cat.categoryName;
                doc.text(catName, xPos, rowY);
                doc.setFont('helvetica', 'bold');
                doc.text(cat.totalTasks.toString(), xPos + 55, rowY);

                col++;
                if (col >= 2) {
                    col = 0;
                    rowY += 5;
                }
            });
            yPos = rowY + (col > 0 ? 5 : 0);
        }

        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(7);
            doc.setTextColor(120, 120, 120);
            doc.text('Generated by Flowboard Project Management System', pageWidth / 2, pageHeight - 8, {
                align: 'center',
            });
        }

        doc.save(`${projectStats.projectName.replace(/\s+/g, '_')}_Analytics_Report.pdf`);
    };

    return (
        <Button appearance={appearance} icon={<DocumentPdfRegular />} onClick={() => void handleGenerate()}>
            Generate PDF Report
        </Button>
    );
}
