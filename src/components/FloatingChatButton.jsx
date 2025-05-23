function FloatingChatButton() {
  return (
    <button
      aria-label="Chat support"
      className="fixed bottom-10 right-10 w-12 h-12 rounded-full bg-[var(--accent-color)] flex items-center justify-center shadow-lg hover:bg-[var(--accent-hover)] transition-colors"
    >
      <i className="fas fa-comment-alt text-white text-lg"></i>
    </button>
  );
}

export default FloatingChatButton;
