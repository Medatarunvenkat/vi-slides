// import React, { useState } from 'react';
// import { Question, questionService } from '../services/questionService';
// import { useAuth } from '../contexts/AuthContext';

// interface QuestionCardProps {
//     question: Question;
//     isTeacher: boolean;
//     isSpotlight?: boolean;
//     onUpdate?: (updatedQuestion: Question) => void;
//     onDelete?: (questionId: string) => void;
// }

// const QuestionCard: React.FC<QuestionCardProps> = ({ question, isTeacher, isSpotlight = false, onUpdate, onDelete }) => {
//     const { user } = useAuth();
//     const [isEditing, setIsEditing] = useState(false);
//     const [editContent, setEditContent] = useState(question.content);
//     const [loading, setLoading] = useState(false);
//     const [aiLoading, setAiLoading] = useState(false);
//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const [teacherResponse, setTeacherResponse] = useState(question.teacherAnswer || '');
//     const [isResponding, setIsResponding] = useState(false);

//     const isOwner = user?.id === question.user?._id;
//     const questionAuthor = question.user?.name || question.guestName || 'Guest';
//     const isGuest = !question.user && question.guestName;

//     const handleUpdate = async () => {
//         if (!editContent.trim() || editContent === question.content) {
//             setIsEditing(false);
//             return;
//         }

//         setLoading(true);
//         try {
//             const response = await questionService.updateQuestion(question._id, editContent);
//             if (response.success && onUpdate) {
//                 onUpdate(response.data);
//             }
//             setIsEditing(false);
//         } catch (err) {
//             console.error('Update error:', err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleTeacherResponse = async () => {
//         if (!teacherResponse.trim() || teacherResponse === question.teacherAnswer) {
//             setIsResponding(false);
//             return;
//         }

//         setLoading(true);
//         try {
//             const response = await questionService.respondToQuestion(question._id, teacherResponse);
//             if (response.success && onUpdate) {
//                 onUpdate(response.data);
//             }
//             setIsResponding(false);
//         } catch (err) {
//             console.error('Response error:', err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleDelete = async () => {
//         setLoading(true);
//         try {
//             const response = await questionService.deleteQuestion(question._id);
//             if (response.success && onDelete) {
//                 onDelete(question._id);
//             }
//         } catch (err) {
//             console.error('Delete error:', err);
//         } finally {
//             setLoading(false);
//             setShowDeleteModal(false);
//         }
//     };

//     const handlePinToggle = async () => {
//         setLoading(true);
//         try {
//             const response = await questionService.togglePin(question._id);
//             if (response.success && onUpdate) {
//                 onUpdate(response.data);
//             }
//         } catch (err) {
//             console.error('Pin error:', err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleAIAnalysis = async () => {
//         setAiLoading(true);
//         try {
//             const response = await questionService.requestAIAnalysis(question._id);
//             if (response.success && onUpdate) {
//                 onUpdate(response.data);
//             }
//         } catch (err) {
//             console.error('AI Analysis error:', err);
//         } finally {
//             setAiLoading(false);
//         }
//     };

//     const handleUpvote = async () => {
//         try {
//             const response = await questionService.toggleUpvote(question._id);
//             if (response.success && onUpdate) {
//                 onUpdate(response.data);
//             }
//         } catch (err) {
//             console.error('Upvote error:', err);
//         }
//     };

//     const timeAgo = (dateStr: string) => {
//         const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
//         if (seconds < 60) return 'just now';
//         const minutes = Math.floor(seconds / 60);
//         if (minutes < 60) return `${minutes}m ago`;
//         return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     };

//     return (
//         <div className="glass-card slide-in" style={{
//             padding: isSpotlight ? '2.5rem' : '1rem',
//             marginBottom: '1rem',
//             borderLeft: question.isPinned ? '4px solid var(--color-warning)' : (isOwner ? '4px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)'),
//             background: question.isPinned ? 'rgba(245, 158, 11, 0.05)' : 'var(--color-surface)',
//             boxShadow: question.isPinned ? '0 0 15px rgba(245, 158, 11, 0.1)' : 'var(--shadow-md)',
//             display: 'flex',
//             gap: isSpotlight ? '2rem' : '1rem',
//             minHeight: isSpotlight ? '600px' : 'auto'
//         }}>
//             {/* Upvote Section */}
//             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
//                 <button
//                     onClick={handleUpvote}
//                     style={{
//                         background: 'none',
//                         border: 'none',
//                         fontSize: isSpotlight ? '2.5rem' : '1.4rem',
//                         cursor: 'pointer',
//                         color: question.upvotes?.includes(user?.id || '') ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
//                         transform: question.upvotes?.includes(user?.id || '') ? 'scale(1.2)' : 'scale(1)',
//                         transition: 'all 0.2s ease'
//                     }}
//                     title="Translate upvote"
//                 >
//                     {question.upvotes?.includes(user?.id || '') ? '🔼' : '⇧'}
//                 </button>
//                 <span style={{ fontSize: isSpotlight ? '1.2rem' : '0.85rem', fontWeight: 'bold', color: question.upvotes?.length > 0 ? 'var(--color-text-secondary)' : 'var(--color-text-muted)' }}>
//                     {question.upvotes?.length || 0}
//                 </span>
//             </div>

//             <div style={{ flex: 1 }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                         {question.isPinned && <span style={{ fontSize: isSpotlight ? '1.8rem' : '1.2rem', marginRight: '4px' }}>📌</span>}
//                         <div style={{
//                             width: isSpotlight ? '48px' : '24px',
//                             height: isSpotlight ? '48px' : '24px',
//                             borderRadius: '50%',
//                             background: isGuest ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' : 'var(--gradient-primary)',
//                             display: 'flex',
//                             alignItems: 'center',
//                             justifyContent: 'center',
//                             fontSize: isSpotlight ? '1.2rem' : '0.7rem',
//                             fontWeight: 'bold',
//                             color: 'white'
//                         }}>
//                             {questionAuthor.charAt(0)}
//                         </div>
//                         <span style={{ fontSize: isSpotlight ? '1.5rem' : '0.85rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
//                             {questionAuthor}
//                             {isGuest && <span style={{ fontSize: isSpotlight ? '0.9rem' : '0.7rem', color: 'var(--color-text-muted)', marginLeft: '0.3rem' }}>(Guest)</span>}
//                         </span>
//                         <span style={{ fontSize: isSpotlight ? '1rem' : '0.75rem', color: 'var(--color-text-muted)' }}>• {timeAgo(question.createdAt)}</span>
//                     </div>

//                     <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
//                         {isTeacher && (
//                             <>
//                                 <button
//                                     onClick={() => setIsResponding(!isResponding)}
//                                     style={{
//                                         background: 'none',
//                                         border: 'none',
//                                         color: 'var(--color-primary-light)',
//                                         cursor: 'pointer',
//                                         fontSize: '0.8rem',
//                                         fontWeight: 'bold',
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         gap: '0.3rem'
//                                     }}
//                                 >
//                                     💬 {question.teacherAnswer ? 'Edit Response' : 'Respond'}
//                                 </button>
//                                 <button
//                                     onClick={handlePinToggle}
//                                     style={{
//                                         background: 'transparent',
//                                         border: 'none',
//                                         cursor: 'pointer',
//                                         fontSize: '1.1rem',
//                                         color: question.isPinned ? 'var(--color-warning)' : 'var(--color-text-muted)',
//                                         padding: '4px',
//                                         borderRadius: '4px',
//                                         transition: 'all 0.2s ease',
//                                         display: 'flex',
//                                         alignItems: 'center'
//                                     }}
//                                     title={question.isPinned ? 'Unpin Question' : 'Pin to Top'}
//                                     className="btn-secondary"
//                                 >
//                                     {question.isPinned ? '📍' : '📌'}
//                                 </button>
//                                 {!question.aiAnalysis && (
//                                     <button
//                                         onClick={handleAIAnalysis}
//                                         disabled={aiLoading || question.analysisStatus === 'pending'}
//                                         style={{
//                                             background: aiLoading || question.analysisStatus === 'pending' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
//                                             border: '1px solid var(--color-primary)',
//                                             color: 'var(--color-primary-light)',
//                                             cursor: aiLoading || question.analysisStatus === 'pending' ? 'not-allowed' : 'pointer',
//                                             fontSize: '0.75rem',
//                                             fontWeight: 'bold',
//                                             padding: '4px 8px',
//                                             borderRadius: '4px',
//                                             transition: 'all 0.2s ease',
//                                             display: 'flex',
//                                             alignItems: 'center',
//                                             gap: '0.3rem'
//                                         }}
//                                         title="Request AI Analysis"
//                                     >
//                                         {aiLoading || question.analysisStatus === 'pending' ? (
//                                             <>
//                                                 <div className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }}></div>
//                                                 Analyzing...
//                                             </>
//                                         ) : (
//                                             <>🤖 Ask AI</>
//                                         )}
//                                     </button>
//                                 )}
//                             </>
//                         )}
//                         {(isOwner && !isEditing) && (
//                             <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
//                         )}
//                         {(isOwner || isTeacher) && (
//                             <button onClick={() => setShowDeleteModal(true)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', opacity: 0.7 }}>Delete</button>
//                         )}
//                     </div>
//                 </div>

//                 {isEditing ? (
//                     <div>
//                         <textarea
//                             className="form-input"
//                             value={editContent}
//                             onChange={(e) => setEditContent(e.target.value)}
//                             style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}
//                             rows={2}
//                         ></textarea>
//                         <div style={{ display: 'flex', gap: '0.5rem' }}>
//                             <button onClick={handleUpdate} className="btn btn-primary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} disabled={loading}>Save</button>
//                             <button onClick={() => setIsEditing(false)} className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} disabled={loading}>Cancel</button>
//                         </div>
//                     </div>
//                 ) : (
//                     <>
//                         <p style={{ fontSize: isSpotlight ? '1.8rem' : '1rem', whiteSpace: 'pre-wrap', margin: 0, lineHeight: isSpotlight ? '1.6' : '1.5' }}>{question.content}</p>

//                         {/* Teacher Response UI */}
//                         {isResponding && isTeacher && (
//                             <div className="anim-slide-down" style={{ marginTop: '1rem' }}>
//                                 <textarea
//                                     className="form-input"
//                                     value={teacherResponse}
//                                     onChange={(e) => setTeacherResponse(e.target.value)}
//                                     placeholder="Type your response here..."
//                                     style={{ fontSize: '0.9rem', marginBottom: '0.5rem', background: 'rgba(99, 102, 241, 0.05)' }}
//                                     rows={2}
//                                 ></textarea>
//                                 <div style={{ display: 'flex', gap: '0.5rem' }}>
//                                     <button onClick={handleTeacherResponse} className="btn btn-primary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} disabled={loading}>Submit Answer</button>
//                                     <button onClick={() => setIsResponding(false)} className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} disabled={loading}>Cancel</button>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Display Teacher Response */}
//                         {question.teacherAnswer && (
//                             <div className="anim-slide-up" style={{
//                                 padding: '0.75rem',
//                                 borderRadius: 'var(--radius-md)',
//                                 background: 'rgba(16, 185, 129, 0.05)',
//                                 border: '1px solid rgba(16, 185, 129, 0.1)',
//                                 marginTop: '0.75rem',
//                                 borderLeft: '4px solid var(--color-success)'
//                             }}>
//                                 <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--color-success)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
//                                     <span>👨‍🏫 TEACHER RESPONSE</span>
//                                     {question.teacherAnsweredAt && (
//                                         <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>
//                                             • {timeAgo(question.teacherAnsweredAt)}
//                                         </span>
//                                     )}
//                                 </div>
//                                 <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: '1.4', fontWeight: '500' }}>
//                                     {question.teacherAnswer}
//                                 </p>
//                             </div>
//                         )}

//                         {/* AI Analysis Integration */}
//                         <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

//                             {/* Status Badges */}
//                             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
//                                 {question.isDirectToTeacher && (
//                                     <span style={{
//                                         fontSize: '0.65rem',
//                                         padding: '0.1rem 0.4rem',
//                                         borderRadius: '4px',
//                                         background: 'rgba(239, 68, 68, 0.1)',
//                                         color: '#ef4444',
//                                         border: '1px solid rgba(239, 68, 68, 0.2)',
//                                         fontWeight: '800',
//                                         textTransform: 'uppercase'
//                                     }}>
//                                         📨 Messaged Teacher
//                                     </span>
//                                 )}

//                                 {question.analysisStatus === 'pending' && (
//                                     <span className="anim-fade-in" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
//                                         🤖 AI is thinking...
//                                     </span>
//                                 )}

//                                 {question.analysisStatus === 'completed' && question.aiAnalysis && (
//                                     <>
//                                         <span style={{
//                                             fontSize: '0.65rem',
//                                             padding: '0.1rem 0.4rem',
//                                             borderRadius: '4px',
//                                             background: question.aiAnalysis.complexity === 'simple' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
//                                             color: question.aiAnalysis.complexity === 'simple' ? 'var(--color-success)' : 'var(--color-primary-light)',
//                                             border: `1px solid ${question.aiAnalysis.complexity === 'simple' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`
//                                         }}>
//                                             {question.aiAnalysis.complexity === 'simple' ? '✓ AI Answered' : '💡 CONCEPT - Teacher'}
//                                         </span>
//                                         <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>
//                                             {question.aiAnalysis.sentiment}
//                                         </span>
//                                         <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>
//                                             Bloom: {question.aiAnalysis.cognitiveLevel}
//                                         </span>
//                                     </>
//                                 )}
//                             </div>

//                             {/* AI Auto-Answer (Only for simple questions) */}
//                             {question.aiAnalysis?.aiAnswer && question.aiAnalysis?.complexity === 'simple' && (
//                                 <div className="anim-slide-up" style={{
//                                     padding: '0.75rem',
//                                     borderRadius: 'var(--radius-md)',
//                                     background: 'rgba(99, 102, 241, 0.05)',
//                                     border: '1px solid rgba(99, 102, 241, 0.1)',
//                                     marginTop: '0.25rem'
//                                 }}>
//                                     <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--color-primary-light)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
//                                         <span>🤖 AI ANSWER</span>
//                                     </div>
//                                     <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: '1.4' }}>
//                                         {question.aiAnalysis.aiAnswer}
//                                     </p>
//                                 </div>
//                             )}
//                         </div>
//                     </>
//                 )}

//                 {/* Delete Confirmation Modal */}
//                 {showDeleteModal && (
//                     <div style={{
//                         position: 'fixed',
//                         top: 0,
//                         left: 0,
//                         right: 0,
//                         bottom: 0,
//                         background: 'rgba(15, 23, 42, 0.6)',
//                         backdropFilter: 'blur(4px)',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         zIndex: 9999
//                     }} onClick={() => setShowDeleteModal(false)}>
//                         <div className="glass-card anim-slide-up" style={{
//                             maxWidth: '320px',
//                             width: '90%',
//                             padding: '1.25rem',
//                             background: 'rgba(30, 41, 59, 0.95)',
//                             border: '1px solid rgba(239, 68, 68, 0.3)',
//                             boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
//                         }} onClick={(e) => e.stopPropagation()}>
//                             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
//                                 <div style={{
//                                     width: '32px',
//                                     height: '32px',
//                                     borderRadius: '50%',
//                                     background: 'var(--color-error)',
//                                     color: 'white',
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     justifyContent: 'center',
//                                     fontSize: '1.2rem'
//                                 }}>🗑</div>
//                                 <div>
//                                     <h4 style={{ fontSize: '1rem', margin: 0, marginBottom: '0.15rem' }}>Delete Question?</h4>
//                                     <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>This cannot be undone</p>
//                                 </div>
//                             </div>

//                             <div style={{ display: 'flex', gap: '0.5rem' }}>
//                                 <button
//                                     onClick={() => setShowDeleteModal(false)}
//                                     className="btn btn-secondary"
//                                     style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
//                                     disabled={loading}
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={handleDelete}
//                                     className="btn btn-primary"
//                                     style={{
//                                         flex: 1,
//                                         padding: '0.5rem',
//                                         fontSize: '0.85rem',
//                                         background: 'var(--color-error)',
//                                         borderColor: 'var(--color-error)'
//                                     }}
//                                     disabled={loading}
//                                 >
//                                     {loading ? <div className="spinner" style={{ width: '14px', height: '14px' }}></div> : 'Delete'}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default QuestionCard;




// // import React, { useState } from 'react';
// // import { Question, questionService } from '../services/questionService';
// // import { useAuth } from '../contexts/AuthContext';

// // interface QuestionCardProps {
// //     question: Question;
// //     isTeacher: boolean;
// //     isSpotlight?: boolean;
// //     onUpdate?: (updatedQuestion: Question) => void;
// //     onDelete?: (questionId: string) => void;
// // }

// // const QuestionCard: React.FC<QuestionCardProps> = ({ question, isTeacher, isSpotlight = false, onUpdate, onDelete }) => {
// //     const { user } = useAuth();
// //     const [isEditing, setIsEditing] = useState(false);
// //     const [editContent, setEditContent] = useState(question.content);
// //     const [loading, setLoading] = useState(false);
// //     const [aiLoading, setAiLoading] = useState(false);
// //     const [showDeleteModal, setShowDeleteModal] = useState(false);
// //     const [teacherResponse, setTeacherResponse] = useState(question.teacherAnswer || '');
// //     const [isResponding, setIsResponding] = useState(false);

// //     const isOwner = user?.id === question.user?._id;
// //     const questionAuthor = question.user?.name || question.guestName || 'Guest';
// //     const isGuest = !question.user && question.guestName;

// //     const handleUpdate = async () => {
// //         if (!editContent.trim() || editContent === question.content) {
// //             setIsEditing(false);
// //             return;
// //         }

// //         setLoading(true);
// //         try {
// //             const response = await questionService.updateQuestion(question._id, editContent);
// //             if (response.success && onUpdate) {
// //                 onUpdate(response.data);
// //             }
// //             setIsEditing(false);
// //         } catch (err) {
// //             console.error('Update error:', err);
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     const handleTeacherResponse = async () => {
// //         if (!teacherResponse.trim() || teacherResponse === question.teacherAnswer) {
// //             setIsResponding(false);
// //             return;
// //         }

// //         console.log('Submitting teacher response:', teacherResponse); // Debug log
// //         setLoading(true);
// //         try {
// //             const response = await questionService.respondToQuestion(question._id, teacherResponse);
// //             console.log('Response from server:', response); // Debug log
// //             if (response.success && onUpdate) {
// //                 onUpdate(response.data);
// //                 console.log('Updated question data:', response.data); // Debug log
// //             }
// //             setIsResponding(false);
// //         } catch (err) {
// //             console.error('Response error:', err);
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     const handleDelete = async () => {
// //         setLoading(true);
// //         try {
// //             const response = await questionService.deleteQuestion(question._id);
// //             if (response.success && onDelete) {
// //                 onDelete(question._id);
// //             }
// //         } catch (err) {
// //             console.error('Delete error:', err);
// //         } finally {
// //             setLoading(false);
// //             setShowDeleteModal(false);
// //         }
// //     };

// //     const handlePinToggle = async () => {
// //         setLoading(true);
// //         try {
// //             const response = await questionService.togglePin(question._id);
// //             if (response.success && onUpdate) {
// //                 onUpdate(response.data);
// //             }
// //         } catch (err) {
// //             console.error('Pin error:', err);
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     const handleAIAnalysis = async () => {
// //         setAiLoading(true);
// //         try {
// //             const response = await questionService.requestAIAnalysis(question._id);
// //             if (response.success && onUpdate) {
// //                 onUpdate(response.data);
// //             }
// //         } catch (err) {
// //             console.error('AI Analysis error:', err);
// //         } finally {
// //             setAiLoading(false);
// //         }
// //     };

// //     const handleUpvote = async () => {
// //         try {
// //             const response = await questionService.toggleUpvote(question._id);
// //             if (response.success && onUpdate) {
// //                 onUpdate(response.data);
// //             }
// //         } catch (err) {
// //             console.error('Upvote error:', err);
// //         }
// //     };

// //     const timeAgo = (dateStr: string) => {
// //         const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
// //         if (seconds < 60) return 'just now';
// //         const minutes = Math.floor(seconds / 60);
// //         if (minutes < 60) return `${minutes}m ago`;
// //         return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
// //     };

// //     return (
// //         <div className="glass-card slide-in" style={{
// //             padding: isSpotlight ? '2rem' : '1rem',
// //             marginBottom: isSpotlight ? '0' : '1rem',
// //             borderLeft: question.isPinned ? '4px solid var(--color-warning)' : (isOwner ? '4px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)'),
// //             background: question.isPinned ? 'rgba(245, 158, 11, 0.05)' : 'var(--color-surface)',
// //             boxShadow: question.isPinned ? '0 0 15px rgba(245, 158, 11, 0.1)' : 'var(--shadow-md)',
// //             display: 'flex',
// //             gap: isSpotlight ? '2rem' : '1rem',
// //             minHeight: isSpotlight ? '100%' : 'auto',
// //             height: isSpotlight ? '100%' : 'auto',
// //             flex: isSpotlight ? 1 : 'auto',
// //             alignItems: 'flex-start',
// //             width: '100%'
// //         }}>
// //             {/* Upvote Section */}
// //             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
// //                 <button
// //                     onClick={handleUpvote}
// //                     style={{
// //                         background: 'none',
// //                         border: 'none',
// //                         fontSize: isSpotlight ? '2.5rem' : '1.4rem',
// //                         cursor: 'pointer',
// //                         color: question.upvotes?.includes(user?.id || '') ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
// //                         transform: question.upvotes?.includes(user?.id || '') ? 'scale(1.2)' : 'scale(1)',
// //                         transition: 'all 0.2s ease'
// //                     }}
// //                     title="Translate upvote"
// //                 >
// //                     {question.upvotes?.includes(user?.id || '') ? '🔼' : '⇧'}
// //                 </button>
// //                 <span style={{ fontSize: isSpotlight ? '1.2rem' : '0.85rem', fontWeight: 'bold', color: question.upvotes?.length > 0 ? 'var(--color-text-secondary)' : 'var(--color-text-muted)' }}>
// //                     {question.upvotes?.length || 0}
// //                 </span>
// //             </div>

// //             <div style={{
// //                 flex: 1,
// //                 display: 'flex',
// //                 flexDirection: 'column',
// //                 minHeight: isSpotlight ? '100%' : 'auto'
// //             }}>
// //                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
// //                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
// //                         {question.isPinned && <span style={{ fontSize: isSpotlight ? '1.8rem' : '1.2rem', marginRight: '4px' }}>📌</span>}
// //                         <div style={{
// //                             width: isSpotlight ? '48px' : '24px',
// //                             height: isSpotlight ? '48px' : '24px',
// //                             borderRadius: '50%',
// //                             background: isGuest ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' : 'var(--gradient-primary)',
// //                             display: 'flex',
// //                             alignItems: 'center',
// //                             justifyContent: 'center',
// //                             fontSize: isSpotlight ? '1.2rem' : '0.7rem',
// //                             fontWeight: 'bold',
// //                             color: 'white'
// //                         }}>
// //                             {questionAuthor.charAt(0)}
// //                         </div>
// //                         <span style={{ fontSize: isSpotlight ? '1.5rem' : '0.85rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
// //                             {questionAuthor}
// //                             {isGuest && <span style={{ fontSize: isSpotlight ? '0.9rem' : '0.7rem', color: 'var(--color-text-muted)', marginLeft: '0.3rem' }}>(Guest)</span>}
// //                         </span>
// //                         <span style={{ fontSize: isSpotlight ? '1rem' : '0.75rem', color: 'var(--color-text-muted)' }}>• {timeAgo(question.createdAt)}</span>
// //                     </div>

// //                     <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
// //                         {isTeacher && (
// //                             <>
// //                                 <button
// //                                     onClick={() => setIsResponding(!isResponding)}
// //                                     style={{
// //                                         background: 'none',
// //                                         border: 'none',
// //                                         color: 'var(--color-primary-light)',
// //                                         cursor: 'pointer',
// //                                         fontSize: '0.8rem',
// //                                         fontWeight: 'bold',
// //                                         display: 'flex',
// //                                         alignItems: 'center',
// //                                         gap: '0.3rem'
// //                                     }}
// //                                 >
// //                                     💬 {question.teacherAnswer ? 'Edit Response' : 'Respond'}
// //                                 </button>
// //                                 <button
// //                                     onClick={handlePinToggle}
// //                                     style={{
// //                                         background: 'transparent',
// //                                         border: 'none',
// //                                         cursor: 'pointer',
// //                                         fontSize: '1.1rem',
// //                                         color: question.isPinned ? 'var(--color-warning)' : 'var(--color-text-muted)',
// //                                         padding: '4px',
// //                                         borderRadius: '4px',
// //                                         transition: 'all 0.2s ease',
// //                                         display: 'flex',
// //                                         alignItems: 'center'
// //                                     }}
// //                                     title={question.isPinned ? 'Unpin Question' : 'Pin to Top'}
// //                                     className="btn-secondary"
// //                                 >
// //                                     {question.isPinned ? '📍' : '📌'}
// //                                 </button>
// //                                 {!question.aiAnalysis && (
// //                                     <button
// //                                         onClick={handleAIAnalysis}
// //                                         disabled={aiLoading || question.analysisStatus === 'pending'}
// //                                         style={{
// //                                             background: aiLoading || question.analysisStatus === 'pending' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
// //                                             border: '1px solid var(--color-primary)',
// //                                             color: 'var(--color-primary-light)',
// //                                             cursor: aiLoading || question.analysisStatus === 'pending' ? 'not-allowed' : 'pointer',
// //                                             fontSize: '0.75rem',
// //                                             fontWeight: 'bold',
// //                                             padding: '4px 8px',
// //                                             borderRadius: '4px',
// //                                             transition: 'all 0.2s ease',
// //                                             display: 'flex',
// //                                             alignItems: 'center',
// //                                             gap: '0.3rem'
// //                                         }}
// //                                         title="Request AI Analysis"
// //                                     >
// //                                         {aiLoading || question.analysisStatus === 'pending' ? (
// //                                             <>
// //                                                 <div className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }}></div>
// //                                                 Analyzing...
// //                                             </>
// //                                         ) : (
// //                                             <>🤖 Ask AI</>
// //                                         )}
// //                                     </button>
// //                                 )}
// //                             </>
// //                         )}
// //                         {(isOwner && !isEditing) && (
// //                             <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
// //                         )}
// //                         {(isOwner || isTeacher) && (
// //                             <button onClick={() => setShowDeleteModal(true)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', opacity: 0.7 }}>Delete</button>
// //                         )}
// //                     </div>
// //                 </div>

// //                 {isEditing ? (
// //                     <div>
// //                         <textarea
// //                             className="form-input"
// //                             value={editContent}
// //                             onChange={(e) => setEditContent(e.target.value)}
// //                             style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}
// //                             rows={2}
// //                         ></textarea>
// //                         <div style={{ display: 'flex', gap: '0.5rem' }}>
// //                             <button onClick={handleUpdate} className="btn btn-primary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} disabled={loading}>Save</button>
// //                             <button onClick={() => setIsEditing(false)} className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} disabled={loading}>Cancel</button>
// //                         </div>
// //                     </div>
// //                 ) : (
// //                     <>
// //                         <p style={{
// //                             fontSize: isSpotlight ? '3rem' : '1rem',
// //                             whiteSpace: 'pre-wrap',
// //                             margin: isSpotlight ? '2rem 0' : '0',
// //                             lineHeight: isSpotlight ? '1.4' : '1.5',
// //                             fontWeight: isSpotlight ? '600' : 'normal',
// //                             color: 'var(--color-text)',
// //                             flex: isSpotlight ? 1 : 'auto'
// //                         }}>{question.content}</p>

// //                         {/* Teacher Response UI */}
// //                         {isResponding && isTeacher && (
// //                             <div className="anim-slide-down" style={{ marginTop: '1rem' }}>
// //                                 <textarea
// //                                     className="form-input"
// //                                     value={teacherResponse}
// //                                     onChange={(e) => setTeacherResponse(e.target.value)}
// //                                     placeholder="Type your response here..."
// //                                     style={{ fontSize: '0.9rem', marginBottom: '0.5rem', background: 'rgba(99, 102, 241, 0.05)' }}
// //                                     rows={2}
// //                                 ></textarea>
// //                                 <div style={{ display: 'flex', gap: '0.5rem' }}>
// //                                     <button onClick={handleTeacherResponse} className="btn btn-primary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} disabled={loading}>Submit Answer</button>
// //                                     <button onClick={() => setIsResponding(false)} className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} disabled={loading}>Cancel</button>
// //                                 </div>
// //                             </div>
// //                         )}

// //                         {/* Display Teacher Response */}
// //                         {question.teacherAnswer && (
// //                             <div className="anim-slide-up" style={{
// //                                 padding: '0.75rem',
// //                                 borderRadius: 'var(--radius-md)',
// //                                 background: 'rgba(16, 185, 129, 0.05)',
// //                                 border: '1px solid rgba(16, 185, 129, 0.1)',
// //                                 marginTop: '0.75rem',
// //                                 borderLeft: '4px solid var(--color-success)'
// //                             }}>
// //                                 <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--color-success)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
// //                                     <span>👨‍🏫 TEACHER RESPONSE</span>
// //                                     {question.teacherAnsweredAt && (
// //                                         <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>
// //                                             • {timeAgo(question.teacherAnsweredAt)}
// //                                         </span>
// //                                     )}
// //                                 </div>
// //                                 <p style={{
// //                                     fontSize: isSpotlight ? '1.2rem' : '0.85rem',
// //                                     color: 'var(--color-text-secondary)',
// //                                     margin: 0,
// //                                     lineHeight: isSpotlight ? '1.8' : '1.6',
// //                                     fontWeight: '500',
// //                                     whiteSpace: 'pre-wrap'
// //                                 }}>
// //                                     {question.teacherAnswer}
// //                                 </p>
// //                             </div>
// //                         )}

// //                         {/* AI Analysis Integration */}
// //                         <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

// //                             {/* Status Badges */}
// //                             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
// //                                 {question.isDirectToTeacher && (
// //                                     <span style={{
// //                                         fontSize: '0.65rem',
// //                                         padding: '0.1rem 0.4rem',
// //                                         borderRadius: '4px',
// //                                         background: 'rgba(239, 68, 68, 0.1)',
// //                                         color: '#ef4444',
// //                                         border: '1px solid rgba(239, 68, 68, 0.2)',
// //                                         fontWeight: '800',
// //                                         textTransform: 'uppercase'
// //                                     }}>
// //                                         📨 Messaged Teacher
// //                                     </span>
// //                                 )}

// //                                 {question.analysisStatus === 'pending' && (
// //                                     <span className="anim-fade-in" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
// //                                         🤖 AI is thinking...
// //                                     </span>
// //                                 )}

// //                                 {question.analysisStatus === 'completed' && question.aiAnalysis && (
// //                                     <>
// //                                         <span style={{
// //                                             fontSize: '0.65rem',
// //                                             padding: '0.1rem 0.4rem',
// //                                             borderRadius: '4px',
// //                                             background: question.aiAnalysis.complexity === 'simple' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
// //                                             color: question.aiAnalysis.complexity === 'simple' ? 'var(--color-success)' : 'var(--color-primary-light)',
// //                                             border: `1px solid ${question.aiAnalysis.complexity === 'simple' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`
// //                                         }}>
// //                                             {question.aiAnalysis.complexity === 'simple' ? '✓ AI Answered' : '💡 CONCEPT - Teacher'}
// //                                         </span>
// //                                         <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>
// //                                             {question.aiAnalysis.sentiment}
// //                                         </span>
// //                                         <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>
// //                                             Bloom: {question.aiAnalysis.cognitiveLevel}
// //                                         </span>
// //                                     </>
// //                                 )}
// //                             </div>

// //                             {/* AI Auto-Answer (Only for simple questions) */}
// //                             {question.aiAnalysis?.aiAnswer && question.aiAnalysis?.complexity === 'simple' && (
// //                                 <div className="anim-slide-up" style={{
// //                                     padding: '0.75rem',
// //                                     borderRadius: 'var(--radius-md)',
// //                                     background: 'rgba(99, 102, 241, 0.05)',
// //                                     border: '1px solid rgba(99, 102, 241, 0.1)',
// //                                     marginTop: '0.25rem'
// //                                 }}>
// //                                     <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--color-primary-light)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
// //                                         <span>🤖 AI ANSWER</span>
// //                                     </div>
// //                                     <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: '1.4' }}>
// //                                         {question.aiAnalysis.aiAnswer}
// //                                     </p>
// //                                 </div>
// //                             )}
// //                         </div>
// //                     </>
// //                 )}

// //                 {/* Delete Confirmation Modal */}
// //                 {showDeleteModal && (
// //                     <div style={{
// //                         position: 'fixed',
// //                         top: 0,
// //                         left: 0,
// //                         right: 0,
// //                         bottom: 0,
// //                         background: 'rgba(15, 23, 42, 0.6)',
// //                         backdropFilter: 'blur(4px)',
// //                         display: 'flex',
// //                         alignItems: 'center',
// //                         justifyContent: 'center',
// //                         zIndex: 9999
// //                     }} onClick={() => setShowDeleteModal(false)}>
// //                         <div className="glass-card anim-slide-up" style={{
// //                             maxWidth: '320px',
// //                             width: '90%',
// //                             padding: '1.25rem',
// //                             background: 'rgba(30, 41, 59, 0.95)',
// //                             border: '1px solid rgba(239, 68, 68, 0.3)',
// //                             boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
// //                         }} onClick={(e) => e.stopPropagation()}>
// //                             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
// //                                 <div style={{
// //                                     width: '32px',
// //                                     height: '32px',
// //                                     borderRadius: '50%',
// //                                     background: 'var(--color-error)',
// //                                     color: 'white',
// //                                     display: 'flex',
// //                                     alignItems: 'center',
// //                                     justifyContent: 'center',
// //                                     fontSize: '1.2rem'
// //                                 }}>🗑</div>
// //                                 <div>
// //                                     <h4 style={{ fontSize: '1rem', margin: 0, marginBottom: '0.15rem' }}>Delete Question?</h4>
// //                                     <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>This cannot be undone</p>
// //                                 </div>
// //                             </div>

// //                             <div style={{ display: 'flex', gap: '0.5rem' }}>
// //                                 <button
// //                                     onClick={() => setShowDeleteModal(false)}
// //                                     className="btn btn-secondary"
// //                                     style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
// //                                     disabled={loading}
// //                                 >
// //                                     Cancel
// //                                 </button>
// //                                 <button
// //                                     onClick={handleDelete}
// //                                     className="btn btn-primary"
// //                                     style={{
// //                                         flex: 1,
// //                                         padding: '0.5rem',
// //                                         fontSize: '0.85rem',
// //                                         background: 'var(--color-error)',
// //                                         borderColor: 'var(--color-error)'
// //                                     }}
// //                                     disabled={loading}
// //                                 >
// //                                     {loading ? <div className="spinner" style={{ width: '14px', height: '14px' }}></div> : 'Delete'}
// //                                 </button>
// //                             </div>
// //                         </div>
// //                     </div>
// //                 )}
// //             </div>
// //         </div>
// //     );
// // };

// // export default QuestionCard;



// import React, { useState } from 'react';
// import { Question, questionService } from '../services/questionService';
// import { useAuth } from '../contexts/AuthContext';

// interface QuestionCardProps {
//     question: Question;
//     isTeacher: boolean;
//     isSpotlight?: boolean;
//     onUpdate?: (updatedQuestion: Question) => void;
//     onDelete?: (questionId: string) => void;
// }

// const QuestionCard: React.FC<QuestionCardProps> = ({ question, isTeacher, isSpotlight = false, onUpdate, onDelete }) => {
//     const { user } = useAuth();
//     const [isEditing, setIsEditing] = useState(false);
//     const [editContent, setEditContent] = useState(question.content);
//     const [loading, setLoading] = useState(false);
//     const [aiLoading, setAiLoading] = useState(false);
//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const [teacherResponse, setTeacherResponse] = useState(question.teacherAnswer || '');
//     const [isResponding, setIsResponding] = useState(false);

//     const isOwner = user?.id === question.user?._id;
//     const questionAuthor = question.user?.name || question.guestName || 'Guest';
//     const isGuest = !question.user && question.guestName;

//     const handleUpdate = async () => {
//         if (!editContent.trim() || editContent === question.content) {
//             setIsEditing(false);
//             return;
//         }

//         setLoading(true);
//         try {
//             const response = await questionService.updateQuestion(question._id, editContent);
//             if (response.success && onUpdate) {
//                 onUpdate(response.data);
//             }
//             setIsEditing(false);
//         } catch (err) {
//             console.error('Update error:', err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleTeacherResponse = async () => {
//         if (!teacherResponse.trim() || teacherResponse === question.teacherAnswer) {
//             setIsResponding(false);
//             return;
//         }

//         console.log('Submitting teacher response:', teacherResponse); // Debug log
//         setLoading(true);
//         try {
//             const response = await questionService.respondToQuestion(question._id, teacherResponse);
//             console.log('Response from server:', response); // Debug log
//             if (response.success && onUpdate) {
//                 onUpdate(response.data);
//                 console.log('Updated question data:', response.data); // Debug log
//             }
//             setIsResponding(false);
//         } catch (err) {
//             console.error('Response error:', err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleDelete = async () => {
//         setLoading(true);
//         try {
//             const response = await questionService.deleteQuestion(question._id);
//             if (response.success && onDelete) {
//                 onDelete(question._id);
//             }
//         } catch (err) {
//             console.error('Delete error:', err);
//         } finally {
//             setLoading(false);
//             setShowDeleteModal(false);
//         }
//     };

//     const handlePinToggle = async () => {
//         setLoading(true);
//         try {
//             const response = await questionService.togglePin(question._id);
//             if (response.success && onUpdate) {
//                 onUpdate(response.data);
//             }
//         } catch (err) {
//             console.error('Pin error:', err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleAIAnalysis = async () => {
//         setAiLoading(true);
//         try {
//             const response = await questionService.requestAIAnalysis(question._id);
//             if (response.success && onUpdate) {
//                 onUpdate(response.data);
//             }
//         } catch (err) {
//             console.error('AI Analysis error:', err);
//         } finally {
//             setAiLoading(false);
//         }
//     };

//     const handleUpvote = async () => {
//         try {
//             const response = await questionService.toggleUpvote(question._id);
//             if (response.success && onUpdate) {
//                 onUpdate(response.data);
//             }
//         } catch (err) {
//             console.error('Upvote error:', err);
//         }
//     };

//     const timeAgo = (dateStr: string) => {
//         const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
//         if (seconds < 60) return 'just now';
//         const minutes = Math.floor(seconds / 60);
//         if (minutes < 60) return `${minutes}m ago`;
//         return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     };

//     return (
//         <div className="glass-card slide-in" style={{
//             padding: isSpotlight ? '2rem' : '1rem',
//             marginBottom: isSpotlight ? '0' : '1rem',
//             borderLeft: question.isPinned ? '4px solid var(--color-warning)' : (isOwner ? '4px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)'),
//             background: question.isPinned ? 'rgba(245, 158, 11, 0.05)' : 'var(--color-surface)',
//             boxShadow: question.isPinned ? '0 0 15px rgba(245, 158, 11, 0.1)' : 'var(--shadow-md)',
//             display: 'flex',
//             gap: isSpotlight ? '2rem' : '1rem',
//             minHeight: isSpotlight ? '100%' : 'auto',
//             height: isSpotlight ? '100%' : 'auto',
//             flex: isSpotlight ? 1 : 'auto',
//             alignItems: 'flex-start',
//             width: '100%'
//         }}>
//             {/* Upvote Section */}
//             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
//                 <button
//                     onClick={handleUpvote}
//                     style={{
//                         background: 'none',
//                         border: 'none',
//                         fontSize: isSpotlight ? '2.5rem' : '1.4rem',
//                         cursor: 'pointer',
//                         color: question.upvotes?.includes(user?.id || '') ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
//                         transform: question.upvotes?.includes(user?.id || '') ? 'scale(1.2)' : 'scale(1)',
//                         transition: 'all 0.2s ease'
//                     }}
//                     title="Translate upvote"
//                 >
//                     {question.upvotes?.includes(user?.id || '') ? '🔼' : '⇧'}
//                 </button>
//                 <span style={{ fontSize: isSpotlight ? '1.2rem' : '0.85rem', fontWeight: 'bold', color: question.upvotes?.length > 0 ? 'var(--color-text-secondary)' : 'var(--color-text-muted)' }}>
//                     {question.upvotes?.length || 0}
//                 </span>
//             </div>

//             <div style={{
//                 flex: 1,
//                 display: 'flex',
//                 flexDirection: 'column',
//                 minHeight: isSpotlight ? '100%' : 'auto'
//             }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                         {question.isPinned && <span style={{ fontSize: isSpotlight ? '1.8rem' : '1.2rem', marginRight: '4px' }}>📌</span>}
//                         <div style={{
//                             width: isSpotlight ? '48px' : '24px',
//                             height: isSpotlight ? '48px' : '24px',
//                             borderRadius: '50%',
//                             background: isGuest ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' : 'var(--gradient-primary)',
//                             display: 'flex',
//                             alignItems: 'center',
//                             justifyContent: 'center',
//                             fontSize: isSpotlight ? '1.2rem' : '0.7rem',
//                             fontWeight: 'bold',
//                             color: 'white'
//                         }}>
//                             {questionAuthor.charAt(0)}
//                         </div>
//                         <span style={{ fontSize: isSpotlight ? '1.5rem' : '0.85rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
//                             {questionAuthor}
//                             {isGuest && <span style={{ fontSize: isSpotlight ? '0.9rem' : '0.7rem', color: 'var(--color-text-muted)', marginLeft: '0.3rem' }}>(Guest)</span>}
//                         </span>
//                         <span style={{ fontSize: isSpotlight ? '1rem' : '0.75rem', color: 'var(--color-text-muted)' }}>• {timeAgo(question.createdAt)}</span>
//                     </div>

//                     <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
//                         {isTeacher && (
//                             <>
//                                 <button
//                                     onClick={() => setIsResponding(!isResponding)}
//                                     style={{
//                                         background: 'none',
//                                         border: 'none',
//                                         color: 'var(--color-primary-light)',
//                                         cursor: 'pointer',
//                                         fontSize: '0.8rem',
//                                         fontWeight: 'bold',
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         gap: '0.3rem'
//                                     }}
//                                 >
//                                     💬 {question.teacherAnswer ? 'Edit Response' : 'Respond'}
//                                 </button>
//                                 <button
//                                     onClick={handlePinToggle}
//                                     style={{
//                                         background: 'transparent',
//                                         border: 'none',
//                                         cursor: 'pointer',
//                                         fontSize: '1.1rem',
//                                         color: question.isPinned ? 'var(--color-warning)' : 'var(--color-text-muted)',
//                                         padding: '4px',
//                                         borderRadius: '4px',
//                                         transition: 'all 0.2s ease',
//                                         display: 'flex',
//                                         alignItems: 'center'
//                                     }}
//                                     title={question.isPinned ? 'Unpin Question' : 'Pin to Top'}
//                                     className="btn-secondary"
//                                 >
//                                     {question.isPinned ? '📍' : '📌'}
//                                 </button>
//                                 {!question.aiAnalysis && (
//                                     <button
//                                         onClick={handleAIAnalysis}
//                                         disabled={aiLoading || question.analysisStatus === 'pending'}
//                                         style={{
//                                             background: aiLoading || question.analysisStatus === 'pending' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
//                                             border: '1px solid var(--color-primary)',
//                                             color: 'var(--color-primary-light)',
//                                             cursor: aiLoading || question.analysisStatus === 'pending' ? 'not-allowed' : 'pointer',
//                                             fontSize: '0.75rem',
//                                             fontWeight: 'bold',
//                                             padding: '4px 8px',
//                                             borderRadius: '4px',
//                                             transition: 'all 0.2s ease',
//                                             display: 'flex',
//                                             alignItems: 'center',
//                                             gap: '0.3rem'
//                                         }}
//                                         title="Request AI Analysis"
//                                     >
//                                         {aiLoading || question.analysisStatus === 'pending' ? (
//                                             <>
//                                                 <div className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }}></div>
//                                                 Analyzing...
//                                             </>
//                                         ) : (
//                                             <>🤖 Ask AI</>
//                                         )}
//                                     </button>
//                                 )}
//                             </>
//                         )}
//                         {(isOwner && !isEditing) && (
//                             <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
//                         )}
//                         {(isOwner || isTeacher) && (
//                             <button onClick={() => setShowDeleteModal(true)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', opacity: 0.7 }}>Delete</button>
//                         )}
//                     </div>
//                 </div>

//                 {isEditing ? (
//                     <div>
//                         <textarea
//                             className="form-input"
//                             value={editContent}
//                             onChange={(e) => setEditContent(e.target.value)}
//                             style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}
//                             rows={2}
//                         ></textarea>
//                         <div style={{ display: 'flex', gap: '0.5rem' }}>
//                             <button onClick={handleUpdate} className="btn btn-primary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} disabled={loading}>Save</button>
//                             <button onClick={() => setIsEditing(false)} className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} disabled={loading}>Cancel</button>
//                         </div>
//                     </div>
//                 ) : (
//                     <>
//                         <p style={{
//                             fontSize: isSpotlight ? '3rem' : '1rem',
//                             whiteSpace: 'pre-wrap',
//                             margin: isSpotlight ? '2rem 0' : '0',
//                             lineHeight: isSpotlight ? '1.4' : '1.5',
//                             fontWeight: isSpotlight ? '600' : 'normal',
//                             color: 'var(--color-text)',
//                             flex: isSpotlight ? 1 : 'auto'
//                         }}>{question.content}</p>

//                         {/* Teacher Response UI */}
//                         {isResponding && isTeacher && (
//                             <div className="anim-slide-down" style={{ marginTop: '1rem' }}>
//                                 <textarea
//                                     className="form-input"
//                                     value={teacherResponse}
//                                     onChange={(e) => setTeacherResponse(e.target.value)}
//                                     placeholder="Type your response here..."
//                                     style={{ fontSize: '0.9rem', marginBottom: '0.5rem', background: 'rgba(99, 102, 241, 0.05)' }}
//                                     rows={2}
//                                 ></textarea>
//                                 <div style={{ display: 'flex', gap: '0.5rem' }}>
//                                     <button onClick={handleTeacherResponse} className="btn btn-primary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} disabled={loading}>Submit Answer</button>
//                                     <button onClick={() => setIsResponding(false)} className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} disabled={loading}>Cancel</button>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Display Teacher Response */}
//                         {question.teacherAnswer && (
//                             <div className="anim-slide-up" style={{
//                                 padding: '0.75rem',
//                                 borderRadius: 'var(--radius-md)',
//                                 background: 'rgba(16, 185, 129, 0.05)',
//                                 border: '1px solid rgba(16, 185, 129, 0.1)',
//                                 marginTop: '0.75rem',
//                                 borderLeft: '4px solid var(--color-success)'
//                             }}>
//                                 <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--color-success)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
//                                     <span>👨‍🏫 TEACHER RESPONSE</span>
//                                     {question.teacherAnsweredAt && (
//                                         <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>
//                                             • {timeAgo(question.teacherAnsweredAt)}
//                                         </span>
//                                     )}
//                                 </div>
//                                 <p style={{
//                                     fontSize: isSpotlight ? '1.2rem' : '0.85rem',
//                                     color: 'var(--color-text-secondary)',
//                                     margin: 0,
//                                     lineHeight: isSpotlight ? '1.8' : '1.6',
//                                     fontWeight: '500',
//                                     whiteSpace: 'pre-wrap'
//                                 }}>
//                                     {question.teacherAnswer}
//                                 </p>
//                             </div>
//                         )}

//                         {/* AI Analysis Integration */}
//                         <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

//                             {/* Status Badges */}
//                             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
//                                 {question.isDirectToTeacher && (
//                                     <span style={{
//                                         fontSize: '0.65rem',
//                                         padding: '0.1rem 0.4rem',
//                                         borderRadius: '4px',
//                                         background: 'rgba(239, 68, 68, 0.1)',
//                                         color: '#ef4444',
//                                         border: '1px solid rgba(239, 68, 68, 0.2)',
//                                         fontWeight: '800',
//                                         textTransform: 'uppercase'
//                                     }}>
//                                         📨 Messaged Teacher
//                                     </span>
//                                 )}

//                                 {question.analysisStatus === 'pending' && (
//                                     <span className="anim-fade-in" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
//                                         🤖 AI is thinking...
//                                     </span>
//                                 )}

//                                 {question.analysisStatus === 'completed' && question.aiAnalysis && (
//                                     <>
//                                         <span style={{
//                                             fontSize: '0.65rem',
//                                             padding: '0.1rem 0.4rem',
//                                             borderRadius: '4px',
//                                             background: question.aiAnalysis.complexity === 'simple' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
//                                             color: question.aiAnalysis.complexity === 'simple' ? 'var(--color-success)' : 'var(--color-primary-light)',
//                                             border: `1px solid ${question.aiAnalysis.complexity === 'simple' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`
//                                         }}>
//                                             {question.aiAnalysis.complexity === 'simple' ? '✓ AI Answered' : '💡 CONCEPT - Teacher'}
//                                         </span>
//                                         <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>
//                                             {question.aiAnalysis.sentiment}
//                                         </span>
//                                         <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>
//                                             Bloom: {question.aiAnalysis.cognitiveLevel}
//                                         </span>
//                                     </>
//                                 )}
//                             </div>

//                             {/* AI Auto-Answer (Only for simple questions) */}
//                             {question.aiAnalysis?.aiAnswer && question.aiAnalysis?.complexity === 'simple' && (
//                                 <div className="anim-slide-up" style={{
//                                     padding: '0.75rem',
//                                     borderRadius: 'var(--radius-md)',
//                                     background: 'rgba(99, 102, 241, 0.05)',
//                                     border: '1px solid rgba(99, 102, 241, 0.1)',
//                                     marginTop: '0.25rem'
//                                 }}>
//                                     <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--color-primary-light)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
//                                         <span>🤖 AI ANSWER</span>
//                                     </div>
//                                     <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: '1.4' }}>
//                                         {question.aiAnalysis.aiAnswer}
//                                     </p>
//                                 </div>
//                             )}
//                         </div>
//                     </>
//                 )}

//                 {/* Delete Confirmation Modal */}
//                 {showDeleteModal && (
//                     <div style={{
//                         position: 'fixed',
//                         top: 0,
//                         left: 0,
//                         right: 0,
//                         bottom: 0,
//                         background: 'rgba(15, 23, 42, 0.6)',
//                         backdropFilter: 'blur(4px)',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         zIndex: 9999
//                     }} onClick={() => setShowDeleteModal(false)}>
//                         <div className="glass-card anim-slide-up" style={{
//                             maxWidth: '320px',
//                             width: '90%',
//                             padding: '1.25rem',
//                             background: 'rgba(30, 41, 59, 0.95)',
//                             border: '1px solid rgba(239, 68, 68, 0.3)',
//                             boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
//                         }} onClick={(e) => e.stopPropagation()}>
//                             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
//                                 <div style={{
//                                     width: '32px',
//                                     height: '32px',
//                                     borderRadius: '50%',
//                                     background: 'var(--color-error)',
//                                     color: 'white',
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     justifyContent: 'center',
//                                     fontSize: '1.2rem'
//                                 }}>🗑</div>
//                                 <div>
//                                     <h4 style={{ fontSize: '1rem', margin: 0, marginBottom: '0.15rem' }}>Delete Question?</h4>
//                                     <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>This cannot be undone</p>
//                                 </div>
//                             </div>

//                             <div style={{ display: 'flex', gap: '0.5rem' }}>
//                                 <button
//                                     onClick={() => setShowDeleteModal(false)}
//                                     className="btn btn-secondary"
//                                     style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
//                                     disabled={loading}
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={handleDelete}
//                                     className="btn btn-primary"
//                                     style={{
//                                         flex: 1,
//                                         padding: '0.5rem',
//                                         fontSize: '0.85rem',
//                                         background: 'var(--color-error)',
//                                         borderColor: 'var(--color-error)'
//                                     }}
//                                     disabled={loading}
//                                 >
//                                     {loading ? <div className="spinner" style={{ width: '14px', height: '14px' }}></div> : 'Delete'}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default QuestionCard;



import React, { useState } from 'react';
import { Question, questionService } from '../services/questionService';
import { useAuth } from '../contexts/AuthContext';

interface QuestionCardProps {
    question: Question;
    isTeacher: boolean;
    isSpotlight?: boolean;
    onUpdate?: (updatedQuestion: Question) => void;
    onDelete?: (questionId: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, isTeacher, isSpotlight = false, onUpdate, onDelete }) => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(question.content);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [teacherResponse, setTeacherResponse] = useState(question.teacherAnswer || '');
    const [isResponding, setIsResponding] = useState(false);

    const isOwner = user?.id === question.user?._id;
    const questionAuthor = question.user?.name || question.guestName || 'Guest';
    const isGuest = !question.user && question.guestName;

    const handleUpdate = async () => {
        if (!editContent.trim() || editContent === question.content) {
            setIsEditing(false);
            return;
        }

        setLoading(true);
        try {
            const response = await questionService.updateQuestion(question._id, editContent);
            if (response.success && onUpdate) {
                onUpdate(response.data);
            }
            setIsEditing(false);
        } catch (err) {
            console.error('Update error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTeacherResponse = async () => {
        if (!teacherResponse.trim() || teacherResponse === question.teacherAnswer) {
            setIsResponding(false);
            return;
        }

        setLoading(true);
        try {
            const response = await questionService.respondToQuestion(question._id, teacherResponse);
            if (response.success && onUpdate) {
                onUpdate(response.data);
            }
            setIsResponding(false);
        } catch (err) {
            console.error('Response error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            const response = await questionService.deleteQuestion(question._id);
            if (response.success && onDelete) {
                onDelete(question._id);
            }
        } catch (err) {
            console.error('Delete error:', err);
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
        }
    };

    const handlePinToggle = async () => {
        setLoading(true);
        try {
            const response = await questionService.togglePin(question._id);
            if (response.success && onUpdate) {
                onUpdate(response.data);
            }
        } catch (err) {
            console.error('Pin error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAIAnalysis = async () => {
        setAiLoading(true);
        try {
            const response = await questionService.requestAIAnalysis(question._id);
            if (response.success && onUpdate) {
                onUpdate(response.data);
            }
        } catch (err) {
            console.error('AI Analysis error:', err);
        } finally {
            setAiLoading(false);
        }
    };

    const handleUpvote = async () => {
        try {
            const response = await questionService.toggleUpvote(question._id);
            if (response.success && onUpdate) {
                onUpdate(response.data);
            }
        } catch (err) {
            console.error('Upvote error:', err);
        }
    };

    const timeAgo = (dateStr: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="glass-card slide-in" style={{
            padding: isSpotlight ? '2rem' : '1rem',
            marginBottom: isSpotlight ? '0' : '1rem',
            borderLeft: question.isPinned ? '4px solid var(--color-warning)' : (isOwner ? '4px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)'),
            background: question.isPinned ? 'rgba(245, 158, 11, 0.05)' : 'var(--color-surface)',
            boxShadow: question.isPinned ? '0 0 15px rgba(245, 158, 11, 0.1)' : 'var(--shadow-md)',
            display: 'flex',
            gap: isSpotlight ? '2rem' : '1rem',
            minHeight: isSpotlight ? '100%' : 'auto',
            height: isSpotlight ? '100%' : 'auto',
            flex: isSpotlight ? 1 : 'auto',
            alignItems: 'flex-start',
            width: '100%'
        }}>
            {/* Upvote Section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                <button
                    onClick={handleUpvote}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: isSpotlight ? '2.5rem' : '1.4rem',
                        cursor: 'pointer',
                        color: question.upvotes?.includes(user?.id || '') ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
                        transform: question.upvotes?.includes(user?.id || '') ? 'scale(1.2)' : 'scale(1)',
                        transition: 'all 0.2s ease'
                    }}
                    title="Translate upvote"
                >
                    {question.upvotes?.includes(user?.id || '') ? '🔼' : '⇧'}
                </button>
                <span style={{ fontSize: isSpotlight ? '1.2rem' : '0.85rem', fontWeight: 'bold', color: question.upvotes?.length > 0 ? 'var(--color-text-secondary)' : 'var(--color-text-muted)' }}>
                    {question.upvotes?.length || 0}
                </span>
            </div>

            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: isSpotlight ? '100%' : 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {question.isPinned && <span style={{ fontSize: isSpotlight ? '1.8rem' : '1.2rem', marginRight: '4px' }}>📌</span>}
                        <div style={{
                            width: isSpotlight ? '48px' : '24px',
                            height: isSpotlight ? '48px' : '24px',
                            borderRadius: '50%',
                            background: isGuest ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' : 'var(--gradient-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: isSpotlight ? '1.2rem' : '0.7rem',
                            fontWeight: 'bold',
                            color: 'white'
                        }}>
                            {questionAuthor.charAt(0)}
                        </div>
                        <span style={{ fontSize: isSpotlight ? '1.5rem' : '0.85rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                            {questionAuthor}
                            {isGuest && <span style={{ fontSize: isSpotlight ? '0.9rem' : '0.7rem', color: 'var(--color-text-muted)', marginLeft: '0.3rem' }}>(Guest)</span>}
                        </span>
                        <span style={{ fontSize: isSpotlight ? '1rem' : '0.75rem', color: 'var(--color-text-muted)' }}>• {timeAgo(question.createdAt)}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                        {isTeacher && (
                            <>
                                <button
                                    onClick={() => setIsResponding(!isResponding)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--color-primary-light)',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.3rem'
                                    }}
                                >
                                    💬 {question.teacherAnswer ? 'Edit Response' : 'Respond'}
                                </button>
                                <button
                                    onClick={handlePinToggle}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '1.1rem',
                                        color: question.isPinned ? 'var(--color-warning)' : 'var(--color-text-muted)',
                                        padding: '4px',
                                        borderRadius: '4px',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                    title={question.isPinned ? 'Unpin Question' : 'Pin to Top'}
                                    className="btn-secondary"
                                >
                                    {question.isPinned ? '📍' : '📌'}
                                </button>
                                {!question.aiAnalysis && (
                                    <button
                                        onClick={handleAIAnalysis}
                                        disabled={aiLoading || question.analysisStatus === 'pending'}
                                        style={{
                                            background: aiLoading || question.analysisStatus === 'pending' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                            border: '1px solid var(--color-primary)',
                                            color: 'var(--color-primary-light)',
                                            cursor: aiLoading || question.analysisStatus === 'pending' ? 'not-allowed' : 'pointer',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.3rem'
                                        }}
                                        title="Request AI Analysis"
                                    >
                                        {aiLoading || question.analysisStatus === 'pending' ? (
                                            <>
                                                <div className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }}></div>
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>🤖 Ask AI</>
                                        )}
                                    </button>
                                )}
                            </>
                        )}
                        {(isOwner && !isEditing) && (
                            <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                        )}
                        {(isOwner || isTeacher) && (
                            <button onClick={() => setShowDeleteModal(true)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', opacity: 0.7 }}>Delete</button>
                        )}
                    </div>
                </div>

                {isEditing ? (
                    <div>
                        <textarea
                            className="form-input"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}
                            rows={2}
                        ></textarea>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={handleUpdate} className="btn btn-primary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} disabled={loading}>Save</button>
                            <button onClick={() => setIsEditing(false)} className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} disabled={loading}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Refinement Status Badge */}
                        {question.refinementStatus === 'pending' && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                marginBottom: '0.5rem',
                                fontSize: '0.75rem',
                                color: 'var(--color-warning)',
                                fontWeight: '600'
                            }}>
                                <div className="spinner" style={{ width: '10px', height: '10px', borderWidth: '1.5px', borderColor: 'var(--color-warning)', borderRightColor: 'transparent' }}></div>
                                Refining grammar & clarity...
                            </div>
                        )}
                        {question.refinementStatus === 'completed' && question.originalContent && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                marginBottom: '0.3rem',
                                fontSize: '0.7rem',
                                color: 'var(--color-success)',
                                fontWeight: '600'
                            }}>
                                ✓ Refined by AI
                            </div>
                        )}

                        <p style={{
                            fontSize: isSpotlight ? '3rem' : '1rem',
                            whiteSpace: 'pre-wrap',
                            margin: isSpotlight ? '2rem 0' : '0',
                            lineHeight: isSpotlight ? '1.4' : '1.5',
                            fontWeight: isSpotlight ? '600' : 'normal',
                            color: 'var(--color-text)',
                            flex: isSpotlight ? 1 : 'auto'
                        }}>{question.content}</p>

                        {/* Show original content if question was refined */}
                        {question.refinementStatus === 'completed' && question.originalContent && question.originalContent !== question.content && (
                            <div style={{
                                marginTop: '0.5rem',
                                padding: '0.5rem',
                                borderRadius: 'var(--radius-sm)',
                                background: 'rgba(107, 114, 128, 0.05)',
                                border: '1px solid rgba(107, 114, 128, 0.1)',
                                fontSize: '0.75rem',
                                color: 'var(--color-text-muted)'
                            }}>
                                <details style={{ cursor: 'pointer' }}>
                                    <summary style={{ fontWeight: '600', userSelect: 'none' }}>Original submission</summary>
                                    <p style={{ margin: '0.3rem 0 0 0', whiteSpace: 'pre-wrap', fontSize: '0.7rem' }}>
                                        {question.originalContent}
                                    </p>
                                </details>
                            </div>
                        )}

                        {/* Teacher Response UI */}
                        {isResponding && isTeacher && (
                            <div className="anim-slide-down" style={{ marginTop: '1rem' }}>
                                <textarea
                                    className="form-input"
                                    value={teacherResponse}
                                    onChange={(e) => setTeacherResponse(e.target.value)}
                                    placeholder="Type your response here..."
                                    style={{ fontSize: '0.9rem', marginBottom: '0.5rem', background: 'rgba(99, 102, 241, 0.05)' }}
                                    rows={2}
                                ></textarea>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={handleTeacherResponse} className="btn btn-primary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} disabled={loading}>Submit Answer</button>
                                    <button onClick={() => setIsResponding(false)} className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} disabled={loading}>Cancel</button>
                                </div>
                            </div>
                        )}

                        {/* Display Teacher Response */}
                        {question.teacherAnswer && (
                            <div className="anim-slide-up" style={{
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                background: 'rgba(16, 185, 129, 0.05)',
                                border: '1px solid rgba(16, 185, 129, 0.1)',
                                marginTop: '0.75rem',
                                borderLeft: '4px solid var(--color-success)'
                            }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--color-success)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <span>👨‍🏫 TEACHER RESPONSE</span>
                                    {question.teacherAnsweredAt && (
                                        <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>
                                            • {timeAgo(question.teacherAnsweredAt)}
                                        </span>
                                    )}
                                </div>
                                <p style={{
                                    fontSize: isSpotlight ? '1.2rem' : '0.85rem',
                                    color: 'var(--color-text-secondary)',
                                    margin: 0,
                                    lineHeight: isSpotlight ? '1.8' : '1.6',
                                    fontWeight: '500',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {question.teacherAnswer}
                                </p>
                            </div>
                        )}

                        {/* AI Analysis Integration */}
                        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

                            {/* Status Badges */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                {question.isDirectToTeacher && (
                                    <span style={{
                                        fontSize: '0.65rem',
                                        padding: '0.1rem 0.4rem',
                                        borderRadius: '4px',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: '#ef4444',
                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                        fontWeight: '800',
                                        textTransform: 'uppercase'
                                    }}>
                                        📨 Messaged Teacher
                                    </span>
                                )}

                                {question.analysisStatus === 'pending' && (
                                    <span className="anim-fade-in" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        🤖 AI is thinking...
                                    </span>
                                )}

                                {question.analysisStatus === 'completed' && question.aiAnalysis && (
                                    <>
                                        <span style={{
                                            fontSize: '0.65rem',
                                            padding: '0.1rem 0.4rem',
                                            borderRadius: '4px',
                                            background: question.aiAnalysis.complexity === 'simple' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                            color: question.aiAnalysis.complexity === 'simple' ? 'var(--color-success)' : 'var(--color-primary-light)',
                                            border: `1px solid ${question.aiAnalysis.complexity === 'simple' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`
                                        }}>
                                            {question.aiAnalysis.complexity === 'simple' ? '✓ AI Answered' : '💡 CONCEPT - Teacher'}
                                        </span>
                                        <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>
                                            {question.aiAnalysis.sentiment}
                                        </span>
                                        <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>
                                            Bloom: {question.aiAnalysis.cognitiveLevel}
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* AI Auto-Answer (Only for simple questions) */}
                            {question.aiAnalysis?.aiAnswer && question.aiAnalysis?.complexity === 'simple' && (
                                <div className="anim-slide-up" style={{
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'rgba(99, 102, 241, 0.05)',
                                    border: '1px solid rgba(99, 102, 241, 0.1)',
                                    marginTop: '0.25rem'
                                }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--color-primary-light)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <span>🤖 AI ANSWER</span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: '1.4' }}>
                                        {question.aiAnalysis.aiAnswer}
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(15, 23, 42, 0.6)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999
                    }} onClick={() => setShowDeleteModal(false)}>
                        <div className="glass-card anim-slide-up" style={{
                            maxWidth: '320px',
                            width: '90%',
                            padding: '1.25rem',
                            background: 'rgba(30, 41, 59, 0.95)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
                        }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'var(--color-error)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem'
                                }}>🗑</div>
                                <div>
                                    <h4 style={{ fontSize: '1rem', margin: 0, marginBottom: '0.15rem' }}>Delete Question?</h4>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>This cannot be undone</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="btn btn-secondary"
                                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="btn btn-primary"
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        fontSize: '0.85rem',
                                        background: 'var(--color-error)',
                                        borderColor: 'var(--color-error)'
                                    }}
                                    disabled={loading}
                                >
                                    {loading ? <div className="spinner" style={{ width: '14px', height: '14px' }}></div> : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionCard;