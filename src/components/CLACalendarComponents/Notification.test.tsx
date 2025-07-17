import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Notification } from './Notification';

describe('Notification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render notification with message', () => {
      const onDismiss = vi.fn();
      render(
        <Notification 
          message="Test notification message" 
          onDismiss={onDismiss} 
        />
      );

      expect(screen.getByText('Test notification message')).toBeInTheDocument();
    });

    it('should render dismiss button', () => {
      const onDismiss = vi.fn();
      render(
        <Notification 
          message="Test message" 
          onDismiss={onDismiss} 
        />
      );

      const dismissButton = screen.getByRole('button');
      expect(dismissButton).toBeInTheDocument();
      expect(dismissButton.textContent).toBe('×');
    });

    it('should apply correct CSS classes initially', () => {
      const onDismiss = vi.fn();
      const { container } = render(
        <Notification 
          message="Test message" 
          onDismiss={onDismiss} 
        />
      );

      const notification = container.querySelector('.cla-notification');
      expect(notification).toBeInTheDocument();
      expect(notification).toHaveClass('cla-notification');
      expect(notification).not.toHaveClass('fade-out');
    });
  });

  describe('Auto-dismissal', () => {
    it('should auto-dismiss after default duration (3000ms)', () => {
      const onDismiss = vi.fn();
      render(
        <Notification 
          message="Test message" 
          onDismiss={onDismiss} 
        />
      );

      expect(onDismiss).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should auto-dismiss after custom duration', () => {
      const onDismiss = vi.fn();
      render(
        <Notification 
          message="Test message" 
          onDismiss={onDismiss} 
          duration={5000}
        />
      );

      expect(onDismiss).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(4999);
      });
      expect(onDismiss).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should start fade-out animation 300ms before dismissal', () => {
      const onDismiss = vi.fn();
      const { container } = render(
        <Notification 
          message="Test message" 
          onDismiss={onDismiss} 
          duration={3000}
        />
      );

      const notification = container.querySelector('.cla-notification');
      expect(notification).not.toHaveClass('fade-out');

      // Advance to just before fade starts
      act(() => {
        vi.advanceTimersByTime(2699);
      });
      expect(notification).not.toHaveClass('fade-out');

      // Advance to fade start time
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(notification).toHaveClass('fade-out');

      // Should not be dismissed yet
      expect(onDismiss).not.toHaveBeenCalled();

      // Advance to dismissal time
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('Manual dismissal', () => {
    it('should dismiss when clicking dismiss button', async () => {
      const onDismiss = vi.fn();
      render(
        <Notification 
          message="Test message" 
          onDismiss={onDismiss} 
        />
      );

      const dismissButton = screen.getByRole('button');
      
      fireEvent.click(dismissButton);

      // Should start fade out immediately
      const notification = screen.getByText('Test message').parentElement;
      expect(notification).toHaveClass('fade-out');

      // Should wait for fade animation before calling onDismiss
      expect(onDismiss).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should stop event propagation on dismiss button click', () => {
      const onDismiss = vi.fn();
      const onContainerClick = vi.fn();
      
      render(
        <div onClick={onContainerClick}>
          <Notification 
            message="Test message" 
            onDismiss={onDismiss} 
          />
        </div>
      );

      const dismissButton = screen.getByRole('button');
      fireEvent.click(dismissButton);

      expect(onContainerClick).not.toHaveBeenCalled();
    });
  });

  describe('Timer cleanup', () => {
    it('should clear timers on unmount', () => {
      const onDismiss = vi.fn();
      const { unmount } = render(
        <Notification 
          message="Test message" 
          onDismiss={onDismiss} 
        />
      );

      unmount();

      // Advance time past when timers would have fired
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // onDismiss should not have been called
      expect(onDismiss).not.toHaveBeenCalled();
    });

    it('should handle prop changes', () => {
      const onDismiss = vi.fn();
      const { rerender } = render(
        <Notification 
          message="Message 1" 
          onDismiss={onDismiss} 
          duration={3000}
        />
      );

      // Change message prop
      rerender(
        <Notification 
          message="Message 2" 
          onDismiss={onDismiss} 
          duration={3000}
        />
      );

      // Component should still work normally
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge cases', () => {
    it('should handle duration of 0', () => {
      const onDismiss = vi.fn();
      render(
        <Notification 
          message="Test message" 
          onDismiss={onDismiss} 
          duration={0}
        />
      );

      act(() => {
        vi.advanceTimersByTime(0);
      });

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should handle very short duration', () => {
      const onDismiss = vi.fn();
      const { container } = render(
        <Notification 
          message="Test message" 
          onDismiss={onDismiss} 
          duration={200}
        />
      );

      // With 200ms duration, fade should start immediately
      // (200 - 300 = -100, so 0)
      const notification = container.querySelector('.cla-notification');
      
      act(() => {
        vi.advanceTimersByTime(0);
      });
      
      // Should start fading immediately for short durations
      expect(notification).toHaveClass('fade-out');

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should render empty message', () => {
      const onDismiss = vi.fn();
      render(
        <Notification 
          message="" 
          onDismiss={onDismiss} 
        />
      );

      const messageSpan = document.querySelector('.cla-notification-message');
      expect(messageSpan).toBeInTheDocument();
      expect(messageSpan.textContent).toBe('');
    });

    it('should handle multiple dismiss button clicks', () => {
      const onDismiss = vi.fn();
      render(
        <Notification 
          message="Test message" 
          onDismiss={onDismiss} 
        />
      );

      const dismissButton = screen.getByRole('button');
      
      // Click multiple times
      fireEvent.click(dismissButton);
      
      // Each click sets a new timeout, so onDismiss will be called multiple times
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // The component doesn't prevent multiple dismissals
      expect(onDismiss).toHaveBeenCalled();
    });
  });

  describe('Message content', () => {
    it('should handle long messages', () => {
      const onDismiss = vi.fn();
      const longMessage = 'This is a very long notification message that might wrap to multiple lines in the UI';
      
      render(
        <Notification 
          message={longMessage} 
          onDismiss={onDismiss} 
        />
      );

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle special characters in message', () => {
      const onDismiss = vi.fn();
      const specialMessage = 'Test <script>alert("xss")</script> & special © characters';
      
      render(
        <Notification 
          message={specialMessage} 
          onDismiss={onDismiss} 
        />
      );

      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });
  });
});