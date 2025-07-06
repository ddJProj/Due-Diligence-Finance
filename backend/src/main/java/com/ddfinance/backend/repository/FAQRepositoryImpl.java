package com.ddfinance.backend.repository;

import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Temporary implementation of FAQRepository.
 * TODO: Replace with actual entity-based repository when FAQ entity is created
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Repository
public class FAQRepositoryImpl implements FAQRepository {

    @Override
    public List<Map<String, String>> findAllActiveOrderByDisplayOrder() {
        // TODO: Replace with database query when FAQ entity is implemented
        return Arrays.asList(
                Map.of(
                        "question", "What is the minimum investment amount?",
                        "answer", "The minimum investment amount is $10,000 for most portfolios. Custom portfolios require a minimum of $50,000.",
                        "category", "Getting Started"
                ),
                Map.of(
                        "question", "How do I upgrade from a guest account to a client account?",
                        "answer", "You can submit an upgrade request through your guest portal. Our team will review your application and contact you within 2-3 business days.",
                        "category", "Account Management"
                ),
                Map.of(
                        "question", "What types of investments are available?",
                        "answer", "We offer individual stocks (NYSE, NASDAQ), ETFs, mutual funds, and customized portfolios based on your risk tolerance and investment goals.",
                        "category", "Investments"
                ),
                Map.of(
                        "question", "What are the management fees?",
                        "answer", "Our standard management fee is 1.0% annually, with a performance fee of 10% on profits above benchmark. Transaction fees are included in the management fee.",
                        "category", "Fees"
                ),
                Map.of(
                        "question", "How often will I receive portfolio updates?",
                        "answer", "You'll receive monthly portfolio summaries and can access real-time portfolio information through your client portal. Your assigned advisor will also schedule quarterly reviews.",
                        "category", "Communication"
                ),
                Map.of(
                        "question", "Is my investment insured?",
                        "answer", "Your investments are protected by SIPC insurance up to $500,000, including $250,000 for cash. Additional insurance may be available for larger accounts.",
                        "category", "Security"
                ),
                Map.of(
                        "question", "Can I withdraw my funds at any time?",
                        "answer", "Yes, you can request withdrawals at any time. Standard processing time is 2-3 business days. Some investments may have specific liquidity terms.",
                        "category", "Withdrawals"
                ),
                Map.of(
                        "question", "How are taxes handled?",
                        "answer", "We provide annual tax documents including 1099-DIV and 1099-B forms. We also offer tax-efficient investment strategies to minimize your tax liability.",
                        "category", "Taxes"
                )
        );
    }
}
