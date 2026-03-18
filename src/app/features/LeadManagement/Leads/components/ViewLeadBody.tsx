import type React from 'react';
import { Link } from 'react-router-dom';
import { AssignedTo, ILead } from '../models/lead';
import { sourceColors } from '../constants/data';
import { Badge } from '@mantine/core';
import ScrollBar from 'react-perfect-scrollbar';

interface OtherField {
    fieldName: string;
    data: string;
}

export default function ViewLeadBody({ lead }: { lead: ILead }) {
    // --- Parse Custom Fields ---
    let customFields: OtherField[] = [];
    if (lead.customFields) {
        try {
            customFields = JSON.parse(lead.customFields) as OtherField[];
        } catch (e) {
            console.error('Error parsing customFields JSON:', e);
            customFields = [];
        }
    }

    // --- Other Fields ---
    const otherFieldValue = lead.otherFields || '';

    return (
        <ScrollBar className="h-full overflow-auto max-h-[calc(100vh-100px)]">
            <div className="flex flex-col w-full justify-center">
                <div className="flex flex-col gap-4 mt-4">
                    {/* --- Standard Lead Fields --- */}
                    <h3 className="px-6 pt-4 text-sm font-semibold text-gray-700">Lead Information</h3>
                    <InfoRow label="First Name" value={lead.firstName || '-'} />
                    <InfoRow label="Last Name" value={lead.lastName || '-'} />
                    <InfoRow label="Email" value={lead.email || '-'} />
                    <InfoRow label="Phone" value={lead.phone || '-'} />
                    <InfoRow label="Source" value={lead.source || '-'} />
                    <InfoRow label="Company Name" value={lead.companyName || '-'} />
                    <InfoRow label="Website" value={lead.websiteUrl || '-'} />
                    <InfoRow label="Job Title" value={lead.jobTitle || '-'} />
                    <InfoRow label="Note" value={lead.note || '-'} />
                    <InfoRow label="Social Media URL" value={lead.socialMediaUrl || '-'} />
                    <InfoRow label="Company LinkedIn" value={lead.companyLinkedInUrl || '-'} />
                    <InfoRow label="Assigned to" value={lead?.assigned_to && lead.assigned_to.length > 0 ? lead.assigned_to.map((user: AssignedTo) => user.name).join(', ') : '-'} />

                    {otherFieldValue && (
                        <>
                            <InfoRow label="Other Field" value={otherFieldValue} />
                        </>
                    )}

                    {customFields && customFields.length > 0 && (
                        <div className="space-y-4">
                            {/* adds spacing between divs */}
                            {(Array.isArray(customFields)
                                ? customFields
                                : (() => {
                                      try {
                                          return JSON.parse(customFields as unknown as string) as OtherField[];
                                      } catch {
                                          return [];
                                      }
                                  })()
                            ).map((field, index) => (
                                <div key={`custom-field-${index}`} className="">
                                    <InfoRow label={field.fieldName || `Field ${index + 1}`} value={field.data || '-'} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* createdAt + createdBy */}
                    <InfoRow
                        label="Created At"
                        value={new Date(lead.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    />
                    <InfoRow
                        label="Updated At"
                        value={new Date(lead.updated_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    />
                    <InfoRow label="Created By" value={lead?.user?.name || '-'} />
                </div>
            </div>
        </ScrollBar>
    );
}

// Component for each information row
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-wrap justify-between bg-BG rounded-lg ">
            <span className="py-3 px-6 font-medium">{label}</span>
            <span className="py-3 px-6 text-end break-all">{value}</span>
        </div>
    );
}
